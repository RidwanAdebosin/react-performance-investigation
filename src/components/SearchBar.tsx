type SearchBarProps = {
  query: string
  onQueryChange: (query: string) => void
}

function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <label className="search">
      <span>Search tasks</span>
      <input
        type="search"
        value={query}
        placeholder="e.g. review, docs"
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </label>
  )
}

export default SearchBar
