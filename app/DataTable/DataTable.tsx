"use client"

import './custom.css'
import { FC, Key, memo, useEffect, useState } from "react"
import _ from 'lodash';
import { supabaseClient } from "@/utils/supabase/client";
import TopPagination from "./components/TopPagination";
import { DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faCalendar, faChevronDown, faDatabase, faHashtag, faImage, faSortAmountDesc, faTextSlash, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CalendarDate, parseDate } from "@internationalized/date";
import InputCell from "./components/InputCell";
import { ImageCell } from "./components/ImageCell";
import Filters, { Rule } from "./components/Filters";
import { ListChildComponentProps, VariableSizeList, areEqual } from "react-window";


interface DataTableProps {
    initialData: any[]
    tableSchema: ColumnDef[]
    tableName?: string
    total: number
    textSearchField?: string
}

interface ColumnDef {
    column_name: string
    data_type: string
}

interface Column {
    name: string
    dataType: string
}

interface Cell {
    k?: string | null // key
    v?: string | null // value
}

interface Row {
    cells: Cell[]
    isHovering: boolean
    isSelected: boolean
    uuidv4: string
}

interface ColumnSortRule {
    field: string,
    mode: "asc" | "desc"
}

interface TableRowProps extends ListChildComponentProps {
    data: Row[]
}

export default function DataTable({
    initialData,
    tableSchema,
    tableName = '',
    total,
    textSearchField = ''
}: DataTableProps) {
    const [totalCount, setTotalCount] = useState<number>(total)
    const [serverData, setServerData] = useState<any[]>(initialData)
    const [serverDataSchema, setServerDataSchema] = useState<ColumnDef[]>(tableSchema)
    const [columns, setColumns] = useState<Column[]>([])
    const [rows, setRows] = useState<Row[]>([])
    const [selectedRows, setSelectedRows] = useState<Row[]>([])
    const [selectedCells, setSelectedCells] = useState<string[]>([]) // This array is compatable with multiple cells selection
    const [editingCell, setEditingCell] = useState<string>('')
    const [showDeleteButon, setShowDeleteButotn] = useState<boolean>(false)
    const [paginationParams, setPaginationParams] = useState<{ from: number, to: number }>({ from: 0, to: 19 })
    const [filterRules, setFilterRules] = useState<Rule[]>([])
    const [textSearchTerm, setTextSearchTerm] = useState<{ field: string, keywords: string }>({ field: textSearchField, keywords: '' })
    const [refetchToggler, setRefetchToggler] = useState<boolean>(false)
    const [sortRule, setSortRule] = useState<ColumnSortRule>({ field: "uuidv4", mode: "asc" })


    useEffect(() => {
        // Subscribe changes from supabase
        const changes = supabaseClient
            .channel('table-db-changes')
            .on('postgres_changes', {
                // event: 'UPDATE',
                event: "*",
                schema: 'public',
                table: 'cities'
            }, (payload) => {
                setRefetchToggler(!refetchToggler)
            })
            .subscribe()
    }, [])

    useEffect(() => {
        let newRows: Row[] = []
        let newColumns: Column[] = serverDataSchema.map(schema => ({
            name: schema.column_name,
            dataType: schema.column_name.indexOf('image') > -1 ? "image" : schema.data_type
        }))
        if (serverData && serverData.length > 0) {
            serverData.forEach((row, rowIndex) => {
                newRows.push({
                    cells: _.map(row, (value, key) => ({
                        k: key,
                        v: value,
                        isEditing: false,
                        isSelected: false
                    })),
                    isHovering: false,
                    isSelected: false,
                    uuidv4: row.uuidv4
                })
            })
        }

        setColumns(newColumns)
        setRows(newRows)
        setSelectedRows([])
        setEditingCell('')
        setSelectedCells([])
    }, [serverData])

    useEffect(() => {
        if (selectedRows.length > 0) {
            setShowDeleteButotn(true)
        } else {
            setShowDeleteButotn(false)
        }
    }, [selectedRows])

    useEffect(() => {
        const refetchServerData = async () => {
            const rpcResult = await supabaseClient.rpc('get_table_column_types', {
                p_schema_name: 'public',
                p_table_name: tableName
            })
            if (rpcResult.error) {
                console.error(rpcResult.error)
            }
            setServerDataSchema(rpcResult.data)

            let query = supabaseClient.from(tableName)
                .select('*', {count: 'exact'})
                .range(paginationParams.from, paginationParams.to)
                .order(sortRule.field, { ascending: true }) // As there is no descending supported by supabase, I only show ascending logic

            filterRules.forEach(filter => {
                if (filter.rule === 'eq') {
                    query = query.eq(filter.field, filter.value)
                } else if (filter.rule === 'lt') {
                    query = query.lt(filter.field, filter.value)
                } else if (filter.rule === 'lte') {
                    query = query.lte(filter.field, filter.value)
                } else if (filter.rule === 'gt') {
                    query = query.gt(filter.field, filter.value)
                } else if (filter.rule === 'gte') {
                    query = query.gte(filter.field, filter.value)
                }
            })

            if (textSearchTerm?.field && textSearchTerm.keywords) {
                query = query.textSearch(textSearchTerm.field, `${textSearchTerm.keywords}:*`)
            }

            const { data, error, count } = await query
            if (error) {
                console.error('Error fetching data:', error)
            } else {
                // console.log('Data:', data)
                setTotalCount(count ?? 0)
                setServerData(data)
            }
        }

        refetchServerData()
    }, [filterRules,
        paginationParams,
        textSearchTerm,
        refetchToggler,
        sortRule
    ])


    const handleUpdateCell = async (uuid: string, k: string, v: string) => {
        const valuesToUpdate: any = {}
        valuesToUpdate[k] = v
        const { error } = await supabaseClient.from(tableName)
            .update(valuesToUpdate)
            .eq('uuidv4', uuid)
        if (error) {
            console.log(`error: ${error.message}`)
        }
    }

    const toggleCellSelection = (rowIndex: number, cellIndex: number, mode: string) => {
        const newSelectedCells = [`${rowIndex}&${cellIndex}`]
        if (mode === 'edit') {
            setEditingCell(`${rowIndex}&${cellIndex}`)
        }
        setSelectedCells(newSelectedCells)
    }

    const isCellSelected = (rowIndex: number, cellIndex: number) => {
        return selectedCells.indexOf(`${rowIndex}&${cellIndex}`) > -1
    }

    const isCellEditing = (rowIndex: number, cellIndex: number) => {
        return editingCell === `${rowIndex}&${cellIndex}`
    }

    const addColumn = async (key: Key) => {
        let dataType = key as string
        const newColumns = [...columns]
        const newColumnName = `column${columns.length}`
        newColumns.push({ name: newColumnName, dataType: dataType })
        const newRows = [...rows]
        newRows.forEach(row => {
            row.cells.push({})
        })
        setColumns(newColumns)
        setRows(newRows)

        // TODO: Add this change to supabase
        // const { data, error } = await supabaseClient.rpc('add_column_to_table', {
        //     column_name: newColumnName,
        //     column_type: dataType,
        //     table_name: tableName
        // })
    }

    const removeColumn = async (columnIndex: number) => {
        const newColumns = [...columns]
        newColumns.splice(columnIndex, 1)

        const newRows = _.cloneDeep(rows)
        newRows.forEach(row => {
            row.cells.splice(columnIndex, 1)
        })
        setColumns(newColumns)
        setRows(newRows)

        // TODO: Add logic for column deletion for supabase
    }

    const onInputCellChange = (rowIndex: number, cellIndex: number, value: string) => {
        const k = columns[cellIndex].name
        const v = value
        const newRows = [...rows]
        newRows[rowIndex].cells[cellIndex].k = k
        newRows[rowIndex].cells[cellIndex].v = v
        setRows(newRows)
        handleUpdateCell(newRows[rowIndex].uuidv4, k, v)
    }

    const onDateCellChange = (date: CalendarDate, rowIndex: number, cellIndex: number) => {
        const k = columns[cellIndex].name
        const v = date.toString()
        const newRows = [...rows]
        newRows[rowIndex].cells[cellIndex].v = v
        setRows(newRows)
        handleUpdateCell(newRows[rowIndex].uuidv4, k, v)
    }

    /**
     * supabase function
     * @param from 
     * @param to 
     */
    const onPageChange = async (from: number, to: number) => {
        setPaginationParams({ from: from, to: to })
    }

    const onFilterApplied = (appliedFilters: Rule[]) => {
        setFilterRules(appliedFilters)
    }

    const onTextSearchChange = (keywords: string) => {
        setTextSearchTerm({ field: textSearchField, keywords: keywords })
    }


    const TableCell = (cell: Cell, rowIndex: number, cellIndex: number) => {
        const dataType = columns[cellIndex].dataType
        const isEditing = isCellEditing(rowIndex, cellIndex)

        let cellContent: any = <></>
        if (dataType === "text") {
            cellContent = isEditing ?
                <InputCell
                    initialValue={cell.v!}
                    onChange={(value) => onInputCellChange(rowIndex, cellIndex, value)} /> : cell.v
        } else if (dataType === "numeric") {
            cellContent = isEditing ?
                <InputCell
                    initialValue={cell.v!}
                    onChange={(value) => onInputCellChange(rowIndex, cellIndex, value)} /> : cell.v
        } else if (dataType === "date") {
            cellContent = isEditing ?
                <DatePicker value={parseDate(cell.v ?? '')}
                    aria-label={columns[cellIndex].name}
                    placeholderValue={undefined}
                    color="primary"
                    radius="none"
                    size="sm"
                    labelPlacement="inside"
                    onChange={(date) => onDateCellChange(date, rowIndex, cellIndex)}
                /> : cell.v
        } else if (dataType === "image") {
            // console.log(`cell.v ${cell.v}`)
            cellContent = <ImageCell url={cell.v} mode={isEditing ? "editing" : "preview"} />
        }

        return <div className="ml-2">
            {cellContent}
        </div>
    }

    const TableRow: FC<TableRowProps> = memo(({ data: rows, index: rowIndex, style }) => {
        return (
            <div style={{
                ...style,
                // height: 'auto'
            }} className="tr h-9" key={`row-${rowIndex}`}>
                
                {rows[rowIndex].cells.map((cell, cellIndex) => (
                    cellIndex === 0 ?
                        <div key={`row-${rowIndex}-cell-${cellIndex}`} className="td hidden" /> :
                        <div key={`row-${rowIndex}-cell-${cellIndex}`}
                            className={`td flex items-center relative whitespace-nowrap text-sm font-medium text-gray-900 border-.5 cursor-default
                                 border-gray-200 ${isCellSelected(rowIndex, cellIndex) ? "z-50 outline outline-2 outline-blue-500" : ''}`}
                            onDoubleClick={() => toggleCellSelection(rowIndex, cellIndex, 'edit')}
                            onClick={() => {
                                toggleCellSelection(rowIndex, cellIndex, 'select')
                                toggleCellSelection(rowIndex, cellIndex, 'edit')
                            }}
                        >
                            {TableCell(cell, rowIndex, cellIndex)}
                        </div>
                ))}
                <div className="td text-sm font-medium text-gray-900 border-.5 border-gray-200 bg-gray-50" />
            </div>
        )
    }, areEqual)


    return <div className="relative">
        <div className="shadow px-6 pb-1 pt-4 mb-2 fixed top-0 left-0 right-0 z-50 bg-white">
            <div className="flex flex-row justify-between">
                <Filters filterOptions={columns.slice(1).map(col => ({ filedName: col.name, dataType: col.dataType }))}
                    textSearchField={textSearchField}
                    onFilterApplied={onFilterApplied}
                    onTextSearchChange={onTextSearchChange}
                />
            </div>

            <TopPagination totalCount={totalCount} onChange={onPageChange} />
        </div>
        <div className="max-w-screen-2xl mt-28">
            <div className="my-2 pb-0.5">
                {/* Table */}
                <div className="ttable shadow h-auto border-b-0 divide-gray-300 mt-3">
                    {/* Table Header */}
                    <div key={'thead0'} className="bg-gray-50">
                        <div className="tr h-10">
                            
                            {columns.map((column, index) => (
                                index === 0 ?
                                    <div key={`col-${index}`} className="th hidden" /> :
                                    <div key={`col-${index}`} className="th flex items-center relative text-left text-sm font-semibold text-gray-900 cursor-pointer border-gray-300 border-.5 hover:bg-gray-200" >
                                        <div className="flex flex-row items-center">
                                            <Dropdown aria-label={`${column.name} drop down button`}>
                                                <DropdownTrigger aria-label="dropdown trigger" className="flex flex-row items-center ml-2 justify-start w-full h-full">
                                                    <div>
                                                        {column.name}
                                                        {
                                                            <FontAwesomeIcon className="ml-2" icon={faChevronDown} />
                                                        }
                                                    </div>
                                                </DropdownTrigger>
                                                <DropdownMenu aria-label="dropdown menu"
                                                    disabledKeys={["datatype_display"]}
                                                    onAction={(key: Key) => {
                                                        if (key === 'sort_by_asc') {
                                                            setSortRule({ field: column.name, mode: 'asc' })
                                                        } else if (key === 'delete') {
                                                            removeColumn(index)
                                                        }
                                                    }}
                                                >
                                                    <DropdownItem key={'datatype_display'} startContent={<FontAwesomeIcon icon={faDatabase} />}>
                                                        {column.dataType}
                                                    </DropdownItem>
                                                    <DropdownItem key={'sort_by_asc'} aria-label="sort column by asc" startContent={<FontAwesomeIcon icon={faSortAmountDesc} />}>
                                                        Sort by asc
                                                    </DropdownItem>
                                                    <DropdownItem key={'delete'} color="danger" aria-label="delete column" startContent={<FontAwesomeIcon icon={faTrash} />}>
                                                        Delete column
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>
                            ))}
                            <div key={'col-head'} className="th flex items-center text-left text-sm font-semibold text-gray-900 bg-gray-200 cursor-pointer border-gray-300 border-.5 hover:bg-gray-300">
                                <Dropdown key={'head-dropdown'} aria-label="dropdown for add column">
                                    <DropdownTrigger aria-label="dropdown trigger" className="ml-2">
                                        <div>
                                            <FontAwesomeIcon icon={faAdd} /> Add Column
                                        </div>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="dropdown menu" onAction={(key) => addColumn(key)}>
                                        <DropdownItem key={'text'} aria-label="Text data type" value={'string'}>
                                            <span>
                                                <FontAwesomeIcon icon={faTextSlash} /> Text
                                            </span>
                                        </DropdownItem>
                                        <DropdownItem key={'numeric'} aria-label="Number data type" value={'number'}>
                                            <span>
                                                <FontAwesomeIcon icon={faHashtag} /> Number
                                            </span>
                                        </DropdownItem>
                                        <DropdownItem key={'date'} aria-label="Datetime data type" value={'datetime'}>
                                            <span>
                                                <FontAwesomeIcon icon={faCalendar} /> Datetime
                                            </span>
                                        </DropdownItem>
                                        <DropdownItem key={'image'} aria-label="Image data type" value={'text'}>
                                            <span>
                                                <FontAwesomeIcon icon={faImage} /> Image
                                            </span>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    {/* Table Body */}
                    <div className="divide-y divide-gray-200 bg-white overflow-auto">
                        <VariableSizeList height={650} itemSize={() => 35} itemCount={rows.length} itemData={rows} width={1400}>
                            {TableRow}
                        </VariableSizeList>
                    </div>
                </div>
            </div>

        </div>
    </div>
}