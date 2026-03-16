State.init({ fromToken: "NEAR", toToken: "USDC", amount: "1" });

const onSwap = () => {
  // TODO: connect router call / transaction flow
  console.log("swap", state.fromToken, state.toToken, state.amount);
};

return (
  <div style={{
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: 16,
    maxWidth: 460,
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#fff"
  }}>
    <h3 style={{ marginTop: 0, marginBottom: 8 }}>demo-token-swap</h3>
    <p style={{ marginTop: 0, color: "#6b7280" }}>Swap widget scaffold for BOS</p>

    <div style={{ display: "grid", gap: 10 }}>
      <input
        value={state.amount}
        onChange={(e) => State.update({ amount: e.target.value })}
        placeholder="Amount"
      />
      <input
        value={state.fromToken}
        onChange={(e) => State.update({ fromToken: e.target.value })}
        placeholder="From token"
      />
      <input
        value={state.toToken}
        onChange={(e) => State.update({ toToken: e.target.value })}
        placeholder="To token"
      />
      <button
        onClick={onSwap}
        style={{
          border: 0,
          borderRadius: 10,
          padding: "10px 14px",
          cursor: "pointer",
          background: "#111827",
          color: "white"
        }}
      >
        Swap (wire router action)
      </button>
    </div>
  </div>
);
