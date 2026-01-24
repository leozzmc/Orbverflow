import asyncio
import websockets
import json

async def main():
    uri = "ws://127.0.0.1:8000/ws/telemetry"
    async with websockets.connect(uri) as ws:
        print("Connected to telemetry stream")
        while True:
            msg = await ws.recv()
            data = json.loads(msg)
            print(f"[tick={data['tick']}] scenario={data['scenario']}")
            for r in data["records"]:
                print(f"  {r['sat_id']} loss={r['packet_loss_pct']:.1f}% snr={r['snr_db']:.1f} {r['link_state']}")
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(main())
