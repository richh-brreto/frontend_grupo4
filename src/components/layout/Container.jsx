function Container({ items, renderItem, getItemKey, className = '' }) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={getItemKey(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default Container;