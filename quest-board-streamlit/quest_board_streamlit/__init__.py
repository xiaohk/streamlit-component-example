import asyncio
import base64
import os
import random
from importlib.metadata import PackageNotFoundError, version
from typing import Literal, TypedDict
from urllib.parse import quote

import streamlit.components.v1 as components

try:
    __version__ = version("quest_board_streamlit")
except PackageNotFoundError:
    __version__ = "unknown"


class QuestBoardEvent(TypedDict):
    event: Literal["quest-clicked"]
    detail: str
    uniqueID: str


class QuestBoardResponse(TypedDict):
    uniqueID: str
    detail: str | bool | dict[str, str | bool]


# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)

_RELEASE = False
# _RELEASE = True

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _component_func = components.declare_component(
        "quest_board",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:3001",
    )
else:
    # When we're distributing a production version of the component, we'll
    # replace the `url` param with `path`, and point it to the component's
    # build directory:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("quest_board", path=build_dir)


# Create a wrapper function for the component. This is an optional
# best practice - we could simply expose the component function returned by
# `declare_component` and call it done. The wrapper allows us to customize
# our component's API: we can pre-process its input args, post-process its
# output value, and add a docstring for users.
def quest_board(
    quests: list[str], event_responses: list[QuestBoardResponse], key: str | None = None
) -> dict[str, list[QuestBoardEvent]]:
    """Create a new instance of "quest_board".

    Parameters
    ----------
    Quests: str
        Quest names.
    event_responses: any
        The event responses to send to the component.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    Custom values that include events to handle.

    """
    # Call through to our private component function. Arguments we pass here
    # will be sent to the frontend, where they'll be available in an "args"
    # dictionary.
    #
    # "default" is a special argument that specifies the initial return
    # value of the component before the user has interacted with it.
    component_value = _component_func(
        quests=quests,
        key=key,
        default=0,
        eventResponses=event_responses,
    )

    # We could modify the value returned from the component if we wanted.
    # There's no need to do this in our simple example - but it's an option.
    return component_value
