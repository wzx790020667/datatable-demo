"use client"

import { useEffect, useState } from "react"

interface CellInputProps {
    type?: string
    initialValue?: string
    onChange: (value: string) => void
}

export default function InputCell({ 
    type, 
    initialValue, 
    onChange 
}: CellInputProps) {
    const [inputValue, setInputValue] = useState<string>('')
    const [debouncedValue, setDebouncedValue] = useState<string>('')

    useEffect(() => {
        setInputValue(initialValue ?? '')
    }, [])
    
    const onCellValueChanged = (value: string) => {
        setInputValue(value)
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 1000);

        return () => {
            clearTimeout(handler)
        }
    }, [inputValue])

    useEffect(() => {
        if (debouncedValue !== '' && inputValue !== initialValue) {
            onChange(debouncedValue)
        }
    }, [debouncedValue])

    return <input type="text" autoFocus className="w-full min-w-0 block border-0 focus:outline-none"
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCellValueChanged(e.target.value)} />
}