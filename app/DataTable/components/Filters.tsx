"use client";

import { Button, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faFilter, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";

export interface Rule {
    field: string 
    rule: string
    value: any
}

interface FilterProps {
    filterOptions?: FilterOption[]
    textSearchField?: string
    onFilterApplied?: (result: Rule[]) => void
    onTextSearchChange?: (keywords: string) => void
}

interface FilterOption {
    filedName: string
    dataType: string
}

interface ColumnOption {
    name: string
    dataType: string
}

interface Selector {
    columnOptions: ColumnOption[]
    selectedField: string
    selectedDataType: string | null
    selectedRule: string | null
    value?: string
}

export default function Filters({
    filterOptions = [],
    textSearchField,
    onFilterApplied,
    onTextSearchChange
}: FilterProps) {
    const [searchValue, setSearchValue] = useState<string>('')
    const [selectors, setSelectors] = useState<Selector[]>([])

    // Reset the selectors' states when column changes
    useEffect(() => {
        setSelectors([])
    }, [filterOptions.length])

    const onSearchChange = () => {
        if (onTextSearchChange) {
            onTextSearchChange(searchValue)
        }
    }

    const onAddSelector = () => {
        const newSelectors: Selector[] = [...selectors, {
            columnOptions: filterOptions.map(option => ({
                name: option.filedName,
                dataType: option.dataType,
            })),
            selectedField: filterOptions.length > 0 ? filterOptions[0].filedName : '',
            selectedDataType: filterOptions.length > 0 ? filterOptions[0].dataType : 'text',
            selectedRule: "eq",
            value: ""
        }]
        setSelectors(newSelectors)
    }

    const onRemoveSelector = (index: number) => {
        const newSelectors = [...selectors]
        newSelectors.splice(index, 1)

        setSelectors(newSelectors)
    }

    const applyFilter = () => {
        const selectedFilters = selectors.map(selector => ({
            field: selector.selectedField ?? '',
            rule: selector.selectedRule ?? '',
            value: selector.value ?? ''
        }))
        if (onFilterApplied) {
            onFilterApplied(selectedFilters)
        }
    }



    const onFieldSelected = (key: Set<string>, index: number) => {
        const selectedField = key.values().next().value
        const newSelectors = [...selectors]
        newSelectors[index].selectedField = selectedField
        setSelectors(newSelectors)
    }

    const onRuleSelected = (key: Set<string>, index: number) => {
        const selectedOperator = key.values().next().value
        const newSelectors = [...selectors]
        newSelectors[index].selectedRule = selectedOperator ?? "="
        setSelectors(newSelectors)
    }

    const onSelectorInputChange = (value: string, index: number) => {
        const newSelectors = [...selectors]
        newSelectors[index].value = value
        setSelectors(newSelectors)
    }

    return <>
        <div className="flex flex-row justify-self-start w-full">
            <Input
                isClearable
                className="max-w-72 min-w-4 mr-2"
                placeholder={`Search by ${textSearchField ?? ''}...`}
                startContent={<FontAwesomeIcon icon={faSearch} />}
                value={searchValue}
                onValueChange={setSearchValue}
            />
            <Button color="primary" className="mr-2" 
                isIconOnly
                startContent={<FontAwesomeIcon icon={faSearch} />}
                onClick={() => onSearchChange()} />
            <Popover shouldCloseOnBlur={true} onClose={applyFilter} >
                <PopoverTrigger>
                    <Button startContent={<FontAwesomeIcon icon={faFilter} />}>
                        Filter
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col w-auto p-4">
                    {
                        selectors.map((selector, i) => (
                            <div key={`selector${i}`} className="flex flex-row items-center mb-3">
                                <span className="text-gray-500 mr-2">{
                                    i === 0 ? 'where' : 'and'
                                }</span>
                                <Select className="max-w-xs min-w-36 mr-2"
                                    aria-label="Select a field name"
                                    defaultSelectedKeys={[selector.selectedField ?? '']}
                                    onSelectionChange={(key) => onFieldSelected(key as Set<string>, i)}
                                >
                                    {
                                        selector.columnOptions.map((option, i) => (
                                            <SelectItem key={option.name} value={option.name}>
                                                {option.name}
                                            </SelectItem>
                                        ))
                                    }
                                </Select>
                                <Select className="max-w-xs min-w-36 mr-2"
                                    aria-label="Select a rule"
                                    defaultSelectedKeys={["eq"]}
                                    selectedKeys={[selector.selectedRule ?? "eq"]}
                                    onSelectionChange={(key) => onRuleSelected(key as Set<string>, i)}
                                >
                                    <SelectItem key={"eq"} value={"="}>
                                        {"="}
                                    </SelectItem>
                                    <SelectItem key={"lt"} value={"<"}>
                                        {"<"}
                                    </SelectItem>
                                    <SelectItem key={"lte"} value={"<="}>
                                        {"<="}
                                    </SelectItem>
                                    <SelectItem key={"gt"} value={">"}>
                                        {">"}
                                    </SelectItem>
                                    <SelectItem key={"gte"} value={">="}>
                                        {">="}
                                    </SelectItem>
                                </Select>
                                <Input placeholder="Value" className="mr-2"
                                    value={selector.value}
                                    onValueChange={(value) => onSelectorInputChange(value, i)} />
                                <Button size="sm" isIconOnly={true} color="danger" onClick={() => onRemoveSelector(i)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </div>
                        ))
                    }
                    <div className="flex flex-row justify-between w-full">
                        <Button size="sm" color="default" startContent={<FontAwesomeIcon icon={faAdd} />} disabled={filterOptions.length === 0} onClick={() => onAddSelector()}> Add filter</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    </>
}