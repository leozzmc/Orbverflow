import asyncio, json, websockets

async def main():
    async with websockets.connect("ws://127.0.0.1:8000/ws") as ws:
        print("connected")
        while True:
            data = json.loads(await ws.recv())
            print("type=", data.get("type"), "keys=", list(data.keys()))

asyncio.run(main())
