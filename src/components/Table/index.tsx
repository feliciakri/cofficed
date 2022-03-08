import React from "react";

import {
	useTable,
	useGroupBy,
	useFilters,
	useSortBy,
	useExpanded,
	usePagination,
	useGlobalFilter,
} from "react-table";
import GlobalFiltering from "./GlobalFiltering";
import { SelectColumnFilter, DefaultColumnFilter } from "./filterfunctions";
import { Table as TableUI } from "@mantine/core";

function RTable({ columns, data }: { columns: any; data: any }) {
	const { globalFilter } = state;

	const defaultColumn = React.useMemo(
		() => ({
			// Let's set up our default Filter UI
			Filter: DefaultColumnFilter,
		}),
		[]
	);
	const filterTypes = React.useMemo(
		() => ({
			text: (rows: any, id: any, filterValue: any) => {
				return rows.filter((row) => {
					const rowValue = row.values[id];
					return rowValue !== undefined
						? String(rowValue)
								.toLowerCase()
								.startsWith(String(filterValue).toLowerCase())
						: true;
				});
			},
		}),
		[]
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		state,
		setGlobalFilter,
	} = useTable(
		{ columns, data, defaultColumn, filterTypes },
		useFilters,
		useGroupBy,
		useGlobalFilter,
		useSortBy,
		useExpanded,
		usePagination
	);
	return (
		<>
			<GlobalFiltering
				filter={globalFilter}
				setFilter={setGlobalFilter}
			/>
			<TableUI {...getTableProps()} style={{ border: "solid 1px blue" }}>
				<thead>
					{headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column) => (
								<th
									{...column.getHeaderProps(
										column.getSortByToggleProps()
									)}
								>
									{column.render("Header")}
									<span>
										{
											// eslint-disable-next-line no-nested-ternary
											column.isSorted
												? column.isSortedDesc
													? " 🔽"
													: " 🔼"
												: ""
										}
									</span>
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map((cell) => (
									<td {...cell.getCellProps()}>
										{cell.render("Cell")}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</TableUI>
		</>
	);
}

export default RTable;
