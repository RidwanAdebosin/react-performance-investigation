type CounterProps = {
  count: number
  onIncrement: () => void
}

function Counter({ count, onIncrement }: CounterProps) {
  return (
    <button type="button" className="counter" onClick={onIncrement}>
      Count is {count}
    </button>
  )
}

export default Counter
