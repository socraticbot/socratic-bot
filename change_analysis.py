from json import dumps

deps = [
    "pylibs/chat",
    "pylibs/zoo",
    "pyprojs/chatserver",
    "pyprojs/telegram",
]
print(f"pwds={dumps(deps)}")
