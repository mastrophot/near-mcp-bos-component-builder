const rows = [
  { symbol: "NEAR", amount: 125.4, usd: 460.22 },
  { symbol: "USDC", amount: 820.0, usd: 820.0 },
  { symbol: "wBTC", amount: 0.03, usd: 1830.5 }
];

const total = rows.reduce((sum, row) => sum + row.usd, 0);

return (
  <div style={{
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    maxWidth: 520,
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#fff"
  }}>
    <h3 style={{ marginTop: 0, marginBottom: 8 }}>demo-portfolio</h3>
    <p style={{ marginTop: 0, color: "#6b7280" }}>Portfolio card scaffold for BOS</p>

    <h2 style={{ marginBottom: 12 }}>$ {total.toFixed(2)}</h2>

    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Asset</th>
          <th style={{ textAlign: "right", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Amount</th>
          <th style={{ textAlign: "right", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>USD</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.symbol}>
            <td style={{ paddingTop: 8 }}>{row.symbol}</td>
            <td style={{ textAlign: "right", paddingTop: 8 }}>{row.amount}</td>
            <td style={{ textAlign: "right", paddingTop: 8 }}>{"$"}{row.usd.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
