'use client'
import React, { useCallback, useRef, useState } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const KeywordTagInput: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path: path || field.name })
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const tags = (value || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim()
      if (!trimmed) return
      if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return
      const newTags = [...tags, trimmed]
      setValue(newTags.join(', '))
      setInputValue('')
    },
    [tags, setValue],
  )

  const removeTag = useCallback(
    (index: number) => {
      const newTags = tags.filter((_, i) => i !== index)
      setValue(newTags.length > 0 ? newTags.join(', ') : '')
    },
    [tags, setValue],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag(inputValue)
      }
      if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
        removeTag(tags.length - 1)
      }
    },
    [inputValue, tags, addTag, removeTag],
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val.includes(',')) {
        const parts = val.split(',')
        for (let i = 0; i < parts.length - 1; i++) {
          addTag(parts[i])
        }
        setInputValue(parts[parts.length - 1])
      } else {
        setInputValue(val)
      }
    },
    [addTag],
  )

  const handleWrapperClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div style={{ marginBottom: '24px' }}>
      <FieldLabel label={field.label || field.name} path={path || field.name} />
      <div
        onClick={handleWrapperClick}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 10px',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          background: 'var(--theme-elevation-0)',
          cursor: 'text',
          minHeight: '40px',
        }}
      >
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              background: 'var(--theme-elevation-100)',
              borderRadius: '12px',
              fontSize: '13px',
              lineHeight: '1.4',
              color: 'var(--theme-elevation-800)',
              whiteSpace: 'nowrap',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(i)
              }}
              aria-label={`Remove ${tag}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '14px',
                lineHeight: '1',
                color: 'var(--theme-elevation-500)',
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Type a keyword...' : ''}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.4',
            flex: '1 1 80px',
            minWidth: '80px',
            padding: '3px 0',
            color: 'var(--theme-elevation-800)',
          }}
        />
      </div>
      <p
        style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--theme-elevation-400)',
        }}
      >
        {field.admin?.description || 'Type a keyword and press comma to add'}
      </p>
    </div>
  )
}
