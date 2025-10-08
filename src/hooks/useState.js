// src/hooks/useState.js
export function useState(initialValue) {
  let _val = initialValue;
  const state = () => _val;
  const setState = (newVal) => {
    _val = typeof newVal === "function" ? newVal(_val) : newVal;
    document.dispatchEvent(new CustomEvent("stateChange"));
  };
  return [state, setState];
}
