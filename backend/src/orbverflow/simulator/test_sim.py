import asyncio
from orbverflow.simulator.engine import SimulatorEngine
from orbverflow.simulator.scenarios import Scenario

async def main():
    engine = SimulatorEngine()

    async def trigger():
        await asyncio.sleep(5)
        engine.trigger_scenario(Scenario.JAMMING, 10)
        await asyncio.sleep(12)
        engine.trigger_scenario(Scenario.SATB_DOWN, 8)

    asyncio.create_task(trigger())
    await engine.run_console_demo()

if __name__ == "__main__":
    asyncio.run(main())
