// filter (search) and sort-by component
export default function FilterComponent({
    searchText,
    onSearchTextChange,
    sortMode,
    onSortModeChange,
    ticketsCount,
    filteredCount,
}) {
    return (
        <div>
            <input
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                placeholder="Search title..."
            />
            <select value={sortMode} onChange={(e) => onSortModeChange(e.target.value)}>
                <option value="title_asc">Title A - Z</option>
                <option value="title_desc">Title Z - A</option>
                <option value="due_asc">Due soonest</option>
                <option value="due_desc">Due latest</option>
            </select>
            <div>
                Showing {filteredCount} / {ticketsCount}
            </div>
        </div>
    );
}
