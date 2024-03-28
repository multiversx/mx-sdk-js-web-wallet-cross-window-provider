export const dialogId = 'mxcwp_confirmation-dialog';
export const confirmId = 'mxcwp_confirm-button';
export const cancelId = 'mxcwp_cancel-button';

const getStyle = () => `
<style>
#${dialogId} {
    position: fixed;
    z-index: 999;
    padding-top: 100px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
  }
  
#${dialogId}:modal {
    max-width: 100vw;
    width: 100vw;
    max-height: 100vh;
    height: 100vh;

  }

  #${dialogId} .content {
    background: #fff;
    border-radius: 20px;
    z-index: 999;
    max-width: 500px;
    margin: auto;
    padding: 0;
    position: relative;
    width: 100%;
  }
  
  #${dialogId} .body {
    padding: 50px 0;
  color: #262525;
  
  }
  
  #${dialogId} .title {
    text-align: center;
    font-size: 1.5rem;
  }
  #${dialogId} .subtitle {
    margin-top: 10px;
    text-align: center;
  }
  
  #${dialogId} .actions-container {
    margin-top: 40px;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  #${dialogId} .button {
    max-width: 200px;
    margin-top: 10px;
  }
  
  
  #${dialogId} button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #efeeee;
    cursor: pointer;
    transition: border-color 0.25s;
  }
  #${dialogId} button:hover {
    border-color: #cacaca;
  }
  #${dialogId} button:focus,
  #${dialogId} button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
  
  #${dialogId} .btn-proceed {
    background-color: #262626;
    color: #fff;
    padding-left: 40px;
    padding-right: 40px;
  }
</style>`;

export const getMarkup = (walletUrl: string) => {
  return `
  ${getStyle()}
      <div class="content">
        <div class="body">
          <div class="title">Confirm on MultiversX Wallet</div>
          <div class="subtitle">
          Continue to ${walletUrl}
          </div>

          <div class="actions-container">
            <button id="${cancelId}" class="button">
              Cancel
            </button>
            <button id="${confirmId}" class="button btn-proceed">
              Continue →
            </button>
          </div>
        </div>
      </div>
`;
};
