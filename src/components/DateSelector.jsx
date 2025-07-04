function DateSelector({ selectedDate, onChange }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ marginRight: '10px' }}>📅 Select Date:</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default DateSelector;
