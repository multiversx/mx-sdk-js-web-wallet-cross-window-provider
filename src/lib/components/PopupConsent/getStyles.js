"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyles = void 0;
const lit_1 = require("lit");
const getStyles = (dialogId) => `#${(0, lit_1.unsafeCSS)(dialogId)} {
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

#${(0, lit_1.unsafeCSS)(dialogId)}:modal {
  max-width: 100vw;
  width: 100vw;
  max-height: 100vh;
  height: 100vh;
}

#${(0, lit_1.unsafeCSS)(dialogId)} .content {
  background: #fff;
  border-radius: 20px;
  z-index: 9999;
  max-width: 500px;
  margin: auto;
  padding: 0;
  position: relative;
  width: 100%;
}

#${(0, lit_1.unsafeCSS)(dialogId)} .body {
  padding: 50px 0;
  color: #262525;
}

#${(0, lit_1.unsafeCSS)(dialogId)} .title {
  text-align: center;
  font-size: 1.5rem;
}
#${(0, lit_1.unsafeCSS)(dialogId)} .subtitle {
  margin-top: 10px;
  text-align: center;
}

#${(0, lit_1.unsafeCSS)(dialogId)} .actions-container {
  margin-top: 40px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

#${(0, lit_1.unsafeCSS)(dialogId)} .button {
  max-width: 200px;
  margin-top: 10px;
}

#${(0, lit_1.unsafeCSS)(dialogId)} button {
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
#${(0, lit_1.unsafeCSS)(dialogId)} button:hover {
  border-color: #cacaca;
}
#${(0, lit_1.unsafeCSS)(dialogId)} button:focus,
#${(0, lit_1.unsafeCSS)(dialogId)} button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

#${(0, lit_1.unsafeCSS)(dialogId)} .btn-proceed {
  background-color: #262626;
  color: #fff;
  padding-left: 40px;
  padding-right: 40px;
}`;
exports.getStyles = getStyles;
//# sourceMappingURL=getStyles.js.map