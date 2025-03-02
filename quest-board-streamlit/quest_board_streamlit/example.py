import asyncio
import os
import random

import streamlit as st
from openai import AsyncOpenAI
from quest_board_streamlit import QuestBoardEvent, QuestBoardResponse, quest_board

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


# ---------------------------------------------------------------------------- #
#                               Helper Functions                               #
# ---------------------------------------------------------------------------- #
async def handle_event(event: QuestBoardEvent) -> QuestBoardResponse | None:
    response = None
    print("event:", event)
    if event["event"] == "quest-clicked":
        response = await handle_quest_clicked(event)

    # Send the response to frontend through props
    if response is not None:
        st.session_state["event_responses"].append(response)
        st.session_state["handled_events"].add(response["uniqueID"])

    return response


async def handle_quest_clicked(event: QuestBoardEvent) -> QuestBoardResponse:
    quest = event["detail"]
    random_reward = len(quest) * 100 * random.randint(0, 10)
    await asyncio.sleep(1)
    return {"uniqueID": event["uniqueID"], "detail": str(random_reward)}


@st.fragment
def display_quest_board():

    # ---------------------------------------------------------------------------- #
    #                                Fetch the data                                #
    # ---------------------------------------------------------------------------- #

    # Initialize the session states
    if "event_responses" not in st.session_state:
        st.session_state["event_responses"] = []

    if "handled_events" not in st.session_state:
        st.session_state["handled_events"] = set()

    # ---------------------------------------------------------------------------- #
    #                              Render the elements                             #
    # ---------------------------------------------------------------------------- #

    # Add some test code to play with the component while it's in development.
    # During development, we can run this just as we would any other Streamlit
    # app: `$ streamlit run my_component/example.py`

    st.subheader("Quest Board")

    # Create an instance of our component with a constant `name` arg, and
    # print its output value.

    key = "quest-board-component"
    quests = [
        "Echoes of the Forgotten Realm",
        "The Ashen King's Bargain",
        "The Clockwork Gambit",
    ]
    component_value = quest_board(quests, st.session_state["event_responses"], key=key)

    st.markdown("---")
    # st.subheader("Component with variable args")

    # # Create a second instance of our component whose `name` arg will vary
    # # based on a text_input widget.
    # #
    # # We use the special "key" argument to assign a fixed identity to this
    # # component instance. By default, when a component's arguments change,
    # # it is considered a new instance and will be re-mounted on the frontend
    # # and lose its current state. In this case, we want to vary the component's
    # # "name" argument without having it get recreated.
    # st.markdown("You've clicked %s times!" % int(num_clicks))

    @st.fragment
    async def event_loop() -> None:
        if component_value and component_value["events"]:
            # Clean the previous responses
            st.session_state["event_responses"] = []
            events_to_handle = []

            for e in component_value["events"]:
                if e["uniqueID"] not in st.session_state["handled_events"]:
                    events_to_handle.append(e)

            print("handled events:", len(st.session_state["handled_events"]))
            print("events to handle:", len(events_to_handle))
            print()

            # Handle the events
            tasks = []
            for e in events_to_handle:
                tasks.append(handle_event(e))

            await asyncio.gather(*tasks)

            if len(events_to_handle) > 0:
                st.rerun(scope="fragment")

    asyncio.run(event_loop())


display_quest_board()
