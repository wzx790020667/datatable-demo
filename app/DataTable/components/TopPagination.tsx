"use client";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, PaginationItem, Selection } from "@nextui-org/react";
import { Pagination } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface TopPaginationProps {
    totalCount: number
    onChange: (from: number, to: number) => void
}

interface pageSizeOption {
    limit: number
    isSelected: boolean
}

export default function TopPagination({
    totalCount,
    onChange
}: TopPaginationProps) {
    const [curPage, setCurPage] = useState<number>(1)
    const [from, setFrom] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(20)
    const [pageSizeOptions, setPageSizeOptions] = useState<pageSizeOption[]>([
        { limit: 20, isSelected: false },
        { limit: 100, isSelected: false },
        { limit: 1000, isSelected: false }
    ])

    const getTo = (offset: number, size: number) => {
        return Math.min(Number(offset) + Number(size) - 1, totalCount - 1)
    }

    useEffect(() => {
        onChange(from, getTo(from, pageSize))
    }, [from, pageSize])

    const onPageSizeChange = (key: React.Key) => {
        const newPageSize = key as number
        setPageSize(newPageSize)
        setCurPage(1)
        setFrom(0)
    }

    const onPageSelected = (selectedPage: number) => {
        const newSkip = Math.min(Number(selectedPage - 1) * pageSize, totalCount - 1)
        setFrom(newSkip)
        setCurPage(selectedPage)
    }

    return <>
        <div className="flex flex-row justify-between w-full my-2 items-center">
            <div className="">
                <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{from}</span> to <span className="font-medium">{getTo(from, pageSize)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                </p>
            </div>
            <div className="flex flex-row justify-end">
                <Dropdown>
                    <DropdownTrigger className="hidden sm:flex">
                        <Button color="primary" endContent={<FontAwesomeIcon icon={faChevronDown} />}>
                            {`${pageSize} items per page`}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        disallowEmptySelection
                        aria-label="Table Columns"
                        closeOnSelect={true}
                        selectionMode="single"
                        onAction={onPageSizeChange}
                        selectedKeys={[pageSize]}
                    >
                        {pageSizeOptions.map((option, index) => (
                            <DropdownItem key={option.limit} className="capitalize">
                                {`${option.limit} items`}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
                <Pagination className="ml-2"
                    showControls
                    total={Math.ceil(totalCount / pageSize)}
                    defaultChecked
                    page={curPage}
                    onChange={onPageSelected}
                />
                {/* <Button color="primary" onClick={() => setCurPage(curPage+1)}>Next Page</Button> */}
            </div>
        </div>
    </>
}