import React, { useEffect, useState, type JSX } from 'react'
import classnames from 'classnames'

import { HeadingLevel } from '../../types/headingLevel'

export type AccordionItemProps = {
  title: React.ReactNode | string
  content: React.ReactNode
  expanded: boolean
  id: string
  className?: string
  headingLevel: HeadingLevel
  handleToggle?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export type AccordionProps = {
  bordered?: boolean
  multiselectable?: boolean
  items: AccordionItemProps[]
  className?: string
} & JSX.IntrinsicElements['div']

export const AccordionItem = ({
  title,
  id,
  content,
  expanded,
  className,
  headingLevel,
  handleToggle,
}: AccordionItemProps): JSX.Element => {
  const headingClasses = classnames('usa-accordion__heading', className)
  const contentClasses = classnames(
    'usa-accordion__content',
    'usa-prose',
    className
  )

  const Heading = headingLevel

  return (
    <>
      <Heading className={headingClasses}>
        <button
          type="button"
          className="usa-accordion__button"
          aria-expanded={expanded}
          aria-controls={id}
          data-testid={`accordionButton_${id}`}
          onClick={handleToggle}>
          {title}
        </button>
      </Heading>
      <div
        id={id}
        data-testid={`accordionItem_${id}`}
        className={contentClasses}
        hidden={!expanded}>
        {content}
      </div>
    </>
  )
}

function buildExpansions(
  items: AccordionItemProps[],
  multiselectable: boolean
) {
  const lastExpandedItem = items.findLast(({ expanded }) => expanded)
  return items.reduce((map, item) => {
    map.set(
      item.id,
      !multiselectable
        ? !!lastExpandedItem && item.id === lastExpandedItem.id
        : !!item.expanded
    )
    return map
  }, new Map<string, boolean | undefined>())
}

export const Accordion = ({
  bordered,
  items,
  className,
  multiselectable = false,
}: AccordionProps): JSX.Element => {
  const [expansions, setExpansions] = useState(
    buildExpansions(items, multiselectable)
  )

  useEffect(() => {
    const knownIds = Array.from(expansions.keys())
    const newItems = items.filter(({ id }) => !knownIds.includes(id))
    if (!newItems.length) return

    setExpansions((prevExpansions) => {
      const updatedExpansions = new Map(prevExpansions)
      const newExpansions = buildExpansions(newItems, multiselectable)
      const newEntries = Array.from(newExpansions.entries())
      if (!multiselectable && newEntries.some(([, value]) => value)) {
        updatedExpansions.forEach((val, key, map) => map.set(key, false))
      }
      for (const [key, value] of newEntries) {
        updatedExpansions.set(key, value)
      }
      return updatedExpansions
    })
  }, [items, expansions])

  const classes = classnames(
    'usa-accordion',
    {
      'usa-accordion--bordered': bordered,
    },
    className
  )

  const toggleItem = (itemId: AccordionItemProps['id']): void => {
    setExpansions((prevExpansions) => {
      const updatedExpansions = new Map(prevExpansions)
      if (updatedExpansions.get(itemId)) {
        updatedExpansions.set(itemId, false)
      } else {
        if (!multiselectable) {
          updatedExpansions.forEach((val, key, map) => map.set(key, false))
        }
        updatedExpansions.set(itemId, true)
      }
      return updatedExpansions
    })
  }

  return (
    <div
      className={classes}
      data-testid="accordion"
      data-allow-multiple={multiselectable || undefined}>
      {items.map((item, i) => (
        <AccordionItem
          key={`accordionItem_${i}`}
          {...item}
          expanded={expansions.get(item.id) ?? false}
          handleToggle={(e): void => {
            if (item.handleToggle) item.handleToggle(e)
            toggleItem(item.id)
          }}
        />
      ))}
    </div>
  )
}

export default Accordion
