const amountFormatter = new Intl.NumberFormat('es-DO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function TransactionItem({ name, date, amount, type }) {
  return (
    <div className="transaction-item">
      <div>
        <h4>{name}</h4>
        <span>{date}</span>
      </div>
      <strong className={type === 'in' ? 'amount-in' : 'amount-out'}>
        {type === 'in' ? '+' : '-'}RD$ {amountFormatter.format(Number(amount || 0))}
      </strong>
    </div>
  );
}

export default TransactionItem;
