import { Streamlit, RenderData } from 'streamlit-component-lib';
import './quest-board.css';
import 'quest-board';

import { QuestBoard } from 'quest-board';

interface EventResponse {
  uniqueID: string;
  detail: string;
}

interface ComponentProps {
  quests: string[];
  eventResponses: EventResponse[];
}

interface PendingEvent {
  event: 'quest-clicked';
  detail: string;
  uniqueID: string;
}

interface ResolveAndReject {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

interface QuestClickedRequest extends ResolveAndReject {
  quest: string;
}

const HEIGHT_OFFSET = 10;

class QuestBoardComponent {
  questBoardContainer: HTMLDivElement;
  questBoardElement: QuestBoard;
  pendingEvents: PendingEvent[] = [];
  eventResolveMap: Map<string, ResolveAndReject> = new Map();
  eventDispatchTimer: number | null = null;
  lastQuestsString: string = '';

  constructor() {
    // Create the Quest board component
    this.questBoardContainer = document.body.appendChild(
      document.createElement('div')
    );
    this.questBoardContainer.classList.add('quest-board-container');
    this.questBoardElement = this.questBoardContainer.appendChild(
      document.createElement('quest-board')
    );

    // Bind event listeners
    /* -------------------------- Quest Clicked ------------------------- */
    this.questBoardElement.addEventListener('quest-clicked', event => {
      const customEvent = event as CustomEvent<QuestClickedRequest>;
      const request = customEvent.detail;
      const uniqueID = crypto.randomUUID();
      this._dispatchPendingEvent(
        'quest-clicked',
        request.quest,
        uniqueID,
        request.resolve,
        request.reject
      );
    });

    /* ------------------------------ Size Observer ----------------------------- */
    // Streamlit doesn't use a responsive size for their components, so we need to
    // track size change manually and update streamlit when it changes.
    const resizeObserver = new ResizeObserver(entry => {
      for (const element of entry) {
        if (element.target === this.questBoardContainer) {
          const bbox = element.target.getBoundingClientRect();
          Streamlit.setFrameHeight(bbox.height + HEIGHT_OFFSET);
        }
      }
    });
    resizeObserver.observe(this.questBoardContainer);
  }

  _dispatchPendingEvent(
    eventName: 'quest-clicked',
    detail: string,
    uniqueID: string,
    resolve: (value: any) => void,
    reject: (reason?: any) => void
  ) {
    this.pendingEvents.push({
      event: eventName,
      detail: detail,
      uniqueID
    });

    this.eventResolveMap.set(uniqueID, {
      resolve: resolve,
      reject: reject
    });

    if (this.eventDispatchTimer) {
      clearTimeout(this.eventDispatchTimer);
    }

    this.eventDispatchTimer = window.setTimeout(() => {
      Streamlit.setComponentValue({
        events: this.pendingEvents
      });
    }, 300);
  }

  /**
   * The component's render function. This will be called immediately after
   * the component is initially loaded, and then again every time the
   * component gets new data from Python.
   */
  onRender(event: Event): void {
    // Get the RenderData from the event
    const data = (event as CustomEvent<RenderData<ComponentProps>>).detail;

    // RenderData.args is the JSON dictionary of arguments sent from the
    // Python script.

    // Avoid re-rendering the component if the conversation string hasn't changed
    const questsString = JSON.stringify(data.args.quests);
    if (questsString !== this.lastQuestsString) {
      this.lastQuestsString = questsString;
      this.questBoardElement.quests = data.args.quests;
    }

    // Handle the event responses
    if (data.args.eventResponses) {
      for (const eventResponse of data.args.eventResponses) {
        const uniqueID = eventResponse.uniqueID;
        const resolveAndReject = this.eventResolveMap.get(uniqueID);
        if (resolveAndReject) {
          resolveAndReject.resolve(eventResponse.detail);

          // If the event is resolved, we remove it from the pending events
          this.pendingEvents = this.pendingEvents.filter(
            event => event.uniqueID !== uniqueID
          );
        }
      }
    }

    // We tell Streamlit to update our frameHeight after each render event, in
    // case it has changed. (This isn't strictly necessary for the example
    // because our height stays fixed, but this is a low-cost function, so
    // there's no harm in doing it redundantly.)
    const bbox = this.questBoardContainer.getBoundingClientRect();
    Streamlit.setFrameHeight(bbox.height + HEIGHT_OFFSET);
  }
}

const main = () => {
  const questBoardComponent = new QuestBoardComponent();
  // Attach our `onRender` handler to Streamlit's render event.
  Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, (event: Event) => {
    questBoardComponent.onRender(event);
  });

  // Tell Streamlit we're ready to start receiving data. We won't get our
  // first RENDER_EVENT until we call this function.
  Streamlit.setComponentReady();

  // Finally, tell Streamlit to update our initial height. We omit the
  // `height` parameter here to have it default to our scrollHeight.
  Streamlit.setFrameHeight();
};

main();
