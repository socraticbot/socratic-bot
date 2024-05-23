import { immerable, produce } from 'immer'
import { atom, useAtom } from 'jotai'
import { CSSProperties, useEffect, useMemo } from 'react'
import { Inspector } from 'react-inspector'
import ReactFlow, { Node, NodeProps, Edge, NodeChange, Handle, Position } from 'reactflow'

import 'reactflow/dist/style.css'

interface Message {
  is_assistant: boolean
  message: string
}

interface ChainCall {
  input_data: any
  output_data: any
  chatgpt_calls: ChatGPTCall[]
}

interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
}

const CostCard: React.FC<{ tokenUsage: TokenUsage }> = ({ tokenUsage }) => {
  const inputCost = tokenUsage.prompt_tokens * 0.01 / 1000
  const outputCost = tokenUsage.completion_tokens * 0.03 / 1000
  const totalCost = inputCost + outputCost

  return (
    <div>
      <div>Input Cost: ${inputCost.toFixed(4)}</div>
      <div>Output Cost: ${outputCost.toFixed(4)}</div>
      <div>Total Cost: ${totalCost.toFixed(4)}</div>
    </div>
  )
}

interface LLMOutput {
  token_usage: TokenUsage
}

interface ChatGPTCall {
  start_time: number
  end_time: number
  llm_output: LLMOutput
  messages: any[]
  generations: any[]
}

const ChatGPTCallCard: React.FC<{ chatGPTCall: ChatGPTCall }> = ({ chatGPTCall }) => {
  const timeElapsed = chatGPTCall.end_time - chatGPTCall.start_time
  const { token_usage } = chatGPTCall.llm_output

  const data = {
    messages: chatGPTCall.messages,
    output: chatGPTCall.generations[0]
  }

  return (
    <div style={{ width: '100%', border: '1px solid black', marginBottom: '2em', padding: '1em', boxSizing: 'border-box' }}>
      <div>Time Elapsed: {timeElapsed.toFixed(2)}s</div>
      <CostCard tokenUsage={token_usage} />
      <Inspector table={false} data={data} />
    </div>
  )
}


const ChainCallCard: React.FC<{ chainCall: ChainCall }> = ({ chainCall }) => {
  const { input_data, output_data, chatgpt_calls } = chainCall
  const cardStyle: CSSProperties = {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    marginBottom: '1em'
  }

  return (
    <div style={{ width: '100%', border: '1px solid black', marginBottom: '2em', padding: '1em', boxSizing: 'border-box' }}>
      <div style={cardStyle}>
        <strong>Input:</strong>
        <Inspector table={false} data={input_data} />
      </div>
      <div style={cardStyle}>
        <strong>Output:</strong>
        <Inspector table={false} data={output_data} />
      </div>
      <div style={cardStyle}>
        <strong>Calls:</strong>
        {
          chatgpt_calls.map(call => <ChatGPTCallCard chatGPTCall={call} />)
        }
      </div>
    </div>
  )
}


interface MessagePack {
  message: Message
  chain_calls: ChainCall[]
}

interface MessageNodeData {
  id: number
  parent: number
  pack: MessagePack
}

type MessageNodeProps = NodeProps<MessageNodeData>

async function step(data: MessagePack[]): Promise<MessagePack> {
  try {
    const body = JSON.stringify(data)

    // Make an HTTP POST request using fetch
    const response = await fetch('http://localhost:8000/step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set correct content type for JSON
      },
      body: body,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get the JSON response body
    const result: MessagePack = await response.json()
    return result
  } catch (error) {
    console.error("Error sending JSON data:", error)
    throw error // Re-throw the error so the caller can handle it
  }
}

class MessageTree {
  [immerable] = true
  nodes: MessageNodeData[]
  positions: { x: number, y: number }[]

  constructor() {
    this.nodes = []
    this.positions = []
  }

  private addNode(parent: number, pack: MessagePack) {
    const id = this.nodes.length
    this.nodes.push({ id, parent, pack })
    if (parent === -1) {
      this.positions.push({ x: 0, y: 0 })
      return
    }
    const parentPosition = this.positions[parent]
    this.positions.push({
      x: parentPosition.x,
      y: parentPosition.y + 300
    })
  }

  reduce(action: MessageTreeAction) {
    switch (action.type) {
      case 'new-user-message':
        const pack: MessagePack = {
          message: {
            is_assistant: false,
            message: action.message
          },
          chain_calls: []
        }
        this.addNode(action.parent, pack)
        return

      case 'new-ai-message':
        this.addNode(action.parent, action.pack)
        return

      case 'node-changes':
        for (const change of action.changes) {
          if (change.type !== 'position') {
            return
          }
          const id = parseInt(change.id)
          const position = change.position
          if (!position) {
            return
          }
          this.positions[id] = position
        }
        return
    }
  }

  computeNodes(): Node<MessageNodeData>[] {
    return this.nodes.map((data, i) => ({
      id: i.toString(),
      position: this.positions[i],
      type: 'message-node',
      data
    }))
  }

  computeEdges(): Edge[] {
    const edges: Edge[] = []
    for (let i = 1; i < this.nodes.length; i += 1) {
      const source = this.nodes[i].parent.toString()
      const target = i.toString()
      edges.push({
        id: `edge-${source}-${target}`,
        source,
        target
      })
    }
    return edges
  }
}

type MessageTreeAction =
  | { type: 'new-user-message', parent: number, message: string }
  | { type: 'new-ai-message', parent: number, pack: MessagePack }
  | { type: 'node-changes', changes: NodeChange[] }
  | { type: 'trigger-reply', parent: number }
  | { type: 'trigger-detail', list: ChainCall[] }

type ModalState =
  | { type: 'user-input', parent: number, input: string }
  | { type: 'details', list: ChainCall[] }

type ModalAction =
  | { type: 'set-user-input', input: string }
  | { type: 'commit-user-input' }
  | { type: 'close-modal' }

type RootAction =
  | { type: 'tree', action: MessageTreeAction }
  | { type: 'modal', action: ModalAction }

class RootState {
  [immerable] = true
  tree: MessageTree
  modal?: ModalState

  constructor() {
    this.tree = new MessageTree
  }

  reduce(action: RootAction) {
    if (action.type === 'tree') {
      if (action.action.type === 'trigger-reply') {
        this.modal = {
          type: 'user-input',
          parent: action.action.parent,
          input: ''
        }
        return
      }

      if (action.action.type === 'trigger-detail') {
        this.modal = {
          type: 'details',
          list: action.action.list
        }
      }

      this.tree.reduce(action.action)
      return
    }

    if (!this.modal) {
      return
    }
    const modalAction = action.action
    switch (modalAction.type) {
      case 'set-user-input':
        if (this.modal.type !== 'user-input') {
          return
        }
        this.modal.input = modalAction.input
        return

      case 'commit-user-input':
        if (this.modal.type !== 'user-input') {
          return
        }
        const treeAction: MessageTreeAction = {
          type: 'new-user-message',
          parent: this.modal.parent,
          message: this.modal.input
        }
        this.tree.reduce(treeAction)
        this.modal = undefined
        return

      case 'close-modal':
        this.modal = undefined
    }
  }
}

const baseAtom = atom(new RootState())
const rootAtom = atom(
  get => get(baseAtom),
  (get, set, action: RootAction) => {
    const root = get(baseAtom)
    const newRoot = produce(root, draft => {
      draft.reduce(action)
    })
    set(baseAtom, newRoot)
  }
)
const treeAtom = atom(
  get => get(rootAtom).tree,
  (_, set, action: MessageTreeAction) => {
    set(rootAtom, { type: 'tree', action })
  }
)
const modalAtom = atom(
  get => get(rootAtom).modal,
  (_, set, action: ModalAction) => {
    set(rootAtom, { type: 'modal', action })
  }
)

const MessageNode: React.FC<MessageNodeProps> = (props) => {
  const [tree, commit] = useAtom(treeAtom)
  const { message } = props.data.pack

  const nodeStyle: CSSProperties = {
    border: '1px solid black',
    padding: '0.5em'
  }
  const messageStyle: CSSProperties = {
    maxWidth: '20em'
  }

  const handleAddReply = () => {
    commit({
      type: 'trigger-reply',
      parent: props.data.id
    })
  }
  const addReplyButton = (
    <button onClick={handleAddReply}>Add Reply</button>
  )

  const handleShowDetail = () => {
    commit({
      type: 'trigger-detail',
      list: props.data.pack.chain_calls
    })
  }
  const showDetailButton = (
    <button onClick={handleShowDetail}>Show Detail</button>
  )

  const generateResponse = () => {
    let id = props.data.id
    const messages: MessagePack[] = []
    while (id >= 0) {
      messages.push(tree.nodes[id].pack)
      id = tree.nodes[id].parent
    }
    messages.reverse()

    step(messages).then((pack) => {
      commit({
        type: 'new-ai-message',
        parent: props.data.id,
        pack
      })
    })
  }
  const generateResponseButton = (
    <button onClick={generateResponse}>Generate Response</button>
  )

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <p style={messageStyle}>{message.message}</p>
      <div>
        {message.is_assistant && addReplyButton}
        {message.is_assistant && showDetailButton}
        {!message.is_assistant && generateResponseButton}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function FlowChart() {
  const [tree, commit] = useAtom(treeAtom)
  const nodeTypes = useMemo(() => ({ 'message-node': MessageNode }), [])

  useEffect(() => {
    step([]).then((pack) => {
      commit({
        type: 'new-ai-message',
        parent: -1,
        pack
      })
    })

  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={tree.computeNodes()}
        edges={tree.computeEdges()}
        onNodesChange={changes => commit({ type: 'node-changes', changes })} />
    </div>
  )
}

function UserInput() {
  const [modal, commit] = useAtom(modalAtom)
  if (!modal || modal.type !== 'user-input') {
    return
  }

  return (
    <div>
      <textarea
        style={{ display: 'block', width: '40em', height: '10em' }}
        value={modal.input}
        onChange={event => {
          commit({
            type: 'set-user-input',
            input: event.target.value
          })
        }}
      />
      <button onClick={() => { commit({ type: 'commit-user-input' }) }} >Commit</button>
    </div>
  )
}

function Detail() {
  const [modal, commit] = useAtom(modalAtom)
  if (!modal || modal.type !== 'details') {
    return
  }

  return (
    <div>
      <button onClick={() => { commit({ type: 'close-modal' }) }} >Close</button>
      <div style={{ height: '80vh', maxWidth: '50em', padding: '1em', overflowY: 'scroll', backgroundColor: 'white' }}>
        {modal.list.map((chainCall, index) => (
          <ChainCallCard key={index} chainCall={chainCall} />
        ))}
      </div>
    </div>
  )
}

function Modal() {
  const [modal,] = useAtom(modalAtom)
  if (!modal) {
    return
  }

  const modalStyle: CSSProperties = {
    position: 'absolute',
    backgroundColor: '#ffffffa0',
    width: '100vw',
    height: '100vh',
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <div style={modalStyle}>
      <UserInput />
      <Detail />
    </div>
  )
}

export default function App() {
  return (
    <div>
      <FlowChart />
      <Modal />
    </div>
  )
}
