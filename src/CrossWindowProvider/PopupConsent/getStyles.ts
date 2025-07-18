export const getStyles = (dialogId: string) => `#${dialogId} {
  position: fixed;
  z-index: 9999;
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
  background: var(--mvx-bg-color-primary);
  border-radius: 20px;
  z-index: 9999;
  max-width: 500px;
  margin: auto;
  padding: 0;
  position: relative;
  width: 100%;
}

#${dialogId} .body {
  padding: 50px 0;
  background-color: var(--mvx-bg-color-primary);
  color: var(--mvx-text-color-primary);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: var(--mvx-button-bg-secondary);
  color: var(--mvx-button-text-secondary);
  cursor: pointer;
  transition: border-color 0.25s;
}

#${dialogId} button:hover {
  color: var(--mvx-button-text-primary);
  background-color: var(--mvx-button-bg-primary);
}

#${dialogId} .btn-proceed {
  color: var(--mvx-button-text-primary);
  background-color: var(--mvx-button-bg-primary);
  padding-left: 40px;
  padding-right: 40px;
}
  
#${dialogId} .btn-proceed:hover {
  opacity: 0.75;
}`;
