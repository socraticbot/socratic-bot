Socratic Chat
============

Our chatting framework, ``socratic-chat``, provides an imperative way to declare a chatbot's behavior, which we call a conversation model. By "imperative", we might one can write a conversation model like this:

.. code-block:: python

    while True:
        user_reply = await get_user_reply()

        # code for generating AI reply
        # ...

        if should_exit_loop:
            break

        await post_assistant_reply(assistant_reply)

This style of defining conversation is very conveninent, as the code structure mirrors the conversation structure. We no longer need to consider a huge state machine, where each user reply transitions the conversation state from one place to another.

We also have two other concepts, *workflows* and *minibots*.

**Workflows**. Those are solutions to well-defined problems, like a normal function call. For instance, given a user reply and a question, we can have a workflow that tells us whether the user has taken a stance on the matter. A workflow be either a single LLM call, chain-of-thought, or something even more complex. We can even compose workflows together to build even bigger workflows.

We need to track the inputs and outputs of workflow calls. For one thing, they can be used for unit testing, monitoring performance regression caused by prompt changes or LLM model upgrades. On the other hand, we might use those data to further improve our system performance, via supervised fine-tuning or offline RL.

**Minibots**. Like how we compose workflows, we can also decompose a conversation model into smaller, dedicated conversation models. We call them minibots, as opposed to our customer facing chatbot. They excel at handling a particular part of a conversation. For instance, we can have a minibot dedicated at guiding the user in listing the pros and cons of a particular matter. Minibots themselves can also call other minibots, maximizing compositionality.

.. note::
    A minibot is different from a workflow in that the minibot can post and receive replies, whereas a workflow cannot.

The Inference Problem
---------------------

The framework sounds fantastic on paper, but it cannot be used on the server side.

Consider a chatbot served over a server. We run the chatbot until it generates a reply. We then *pause* the bot until we get a user reply. After receiving the user reply, we *resume* the chatbot to keep generating. This pause/resume cycle continues until the conversation is over.

How do we pause and resume an arbitrary Python program? We might be able to do it fancy coroutine code. But in a cloud-native world, our server must also be *stateless*. Any user reply, which is also a request for the next AI message, must be able to be handled by any server instance. If that single generation fails, it must not cause any troubles to the whole system. Our client can simply retry the request.

This stateless requirement renders the coroutine based code pause/resume useless. Of course, we can play some deep dark magic, including serializing the state of Python interpreter, or even dump the memory of a running process. But there is a safer and simpler solution: **memoization**.

Memoization
^^^^^^^^^^^

Theoretically, we can run the conversation until it needs a user reply. We can then simply exit the program. When the user reply becomes available, we can replay the bot from the very beginning, but this time, when it needs a user reply, we actually returns the reply we just received. As long as the execution of our chatbot is *deterministic* and gives *consistent* outputs, it is functionally equivalent to pause and resume.

But we have two problems. First, LLM calls are not deterministic in general. They can return different results from the same input. Second, LLM calls are costly. They are expensive, and take forever to run.

The solution? We just record the result of each LLM call, and replay those results during the following executions. Moreover, we can simply record the result of a top-level workflow call instead of an atomic LLM call, to further improve the performance.

The process would look like this:

1. We are in replay mode. For every workflow call, we look up its result from its initial recording.
2. We hit an unprocessed user reply. We switch to recording mode.
3. We record all workflow calls, until we hit the next ``get_user_reply``, at which point we exit the code.

This is all made possible by a powerful Python feature called decorators. It allows us to perform arbitrary code before and after a function call. We can even skip the actual call entirely.

Problems
^^^^^^^^

To actually make this happen is still hard, hence why I wrote this design doc. Here a a few problems.

- **Call identification**. We need a consistent way to identify workflows across replays.

- **Nesting and concurrent execution**. This is further complicated by the fact that workflows can call another workflows, and that workflows can run code concurrently to further reduce latency. For instance, they can make three LLM calls concurrently, and build something out of these results.

- **Minibots**. On the one hand, the ID assignment algorithm must work with minibots. On the other hand, it is much more efficient to skip the replay of a complete minibot call. We need to reconcile this optimization with the algorithm, too.
