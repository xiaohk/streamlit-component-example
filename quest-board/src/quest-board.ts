import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * An example element.
 */
@customElement('quest-board')
export class QuestBoard extends LitElement {
  @property({ type: Array })
  quests: string[] = [];

  @state()
  rewardMap = new Map();

  async questClicked(quest: string) {
    const { promise, resolve, reject } = Promise.withResolvers<number>();

    // Emit the event to let the parent to find the reward
    const event = new CustomEvent('quest-clicked', {
      detail: { quest, resolve, reject },
      composed: true,
      bubbles: true,
    });
    this.dispatchEvent(event);

    // Update the rewardMap after the parent resolves the promise
    const reward = await promise;
    this.rewardMap.set(quest, reward);
    this.requestUpdate();
    return reward;
  }

  render() {
    let questItems = html``;
    for (const quest of this.quests) {
      questItems = html`${questItems}
        <div class="quest-item">
          <div class="quest-name">${quest}</div>
          <div class="quest-reward">
            ${this.rewardMap.has(quest)
              ? '$' + this.rewardMap.get(quest)
              : 'Unknown'}
          </div>
          <button class="quest-button" @click=${() => this.questClicked(quest)}>
            check reward
          </button>
        </div> `;
    }
    return html` <div class="quest-board">${questItems}</div> `;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .quest-board {
      display: flex;
      flex-direction: column;
      gap: 30px;

      .quest-item {
        display: flex;
        flex-direction: column;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 10px;

        .quest-name {
          font-weight: 600;
        }

        .quest-reward {
          font-style: italic;
        }
      }
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'quest-board': QuestBoard;
  }
}
