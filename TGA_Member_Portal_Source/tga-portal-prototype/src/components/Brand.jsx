export function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <img src="./tga-mark.svg" alt="TGA shield" />
      <div>
        <strong>The Gun Association</strong>
        {!compact && <span>Membership · Compliance · Support</span>}
      </div>
    </div>
  );
}
