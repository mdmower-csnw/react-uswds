import React, { useEffect, useRef, type JSX } from 'react'
import classnames from 'classnames'
import { HeadingLevel } from '../../types/headingLevel'
import styles from './InPageNavigation.module.scss'

export type InPageNavigationProps = {
  className?: string
  content: JSX.Element
  headingLevel?: HeadingLevel
  mainProps?: JSX.IntrinsicElements['main']
  navProps?: JSX.IntrinsicElements['nav']
  rootMargin?: string
  scrollOffset?: string
  threshold?: number
  minimumHeadingCount?: number
  title?: string
  contentSelector?: string
  headingElements?: HeadingLevel[]
} & Omit<JSX.IntrinsicElements['div'], 'content'>

export const InPageNavigation = ({
  className,
  content,
  headingLevel = 'h4',
  mainProps,
  navProps,
  rootMargin = '0px 0px 0px 0px',
  scrollOffset,
  threshold = 1,
  minimumHeadingCount = 2,
  title = 'On this page',
  contentSelector,
  headingElements = ['h2', 'h3'],
  ...divProps
}: InPageNavigationProps): JSX.Element => {
  const asideClasses = classnames(
    'usa-in-page-nav',
    'display-none',
    styles.target,
    className
  )
  const { className: navClassName, ...remainingNavProps } = navProps || {}
  const navClasses = classnames('usa-in-page-nav__nav', navClassName)
  const { className: mainClassName, ...remainingMainProps } = mainProps || {}
  const mainClasses = classnames('main-content', mainClassName)
  const Heading = headingLevel
  const offsetStyle = {
    '--margin-offset': scrollOffset,
  } as React.CSSProperties
  headingElements = !headingElements.length
    ? ['h2', 'h3']
    : headingElements.sort()
  const mainRef = useRef<HTMLElement>(null)
  const asideRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = contentSelector
      ? mainRef.current?.querySelector(contentSelector)
      : mainRef.current
    if (!container) return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const aside = asideRef.current
      if (!aside) return

      const entry = entries.findLast((entry) => entry.isIntersecting)
      const id = entry?.target.id
      if (!id) return

      aside.querySelectorAll('a').forEach((a) => {
        a.classList.toggle('usa-current', a.dataset.id === id)
      })
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold,
    })

    container
      .querySelectorAll(headingElements.join(','))
      .forEach((h) => observer.observe(h))
    document.documentElement.classList.add(styles['smooth-scroll'])

    return () => {
      document.documentElement.classList.remove(styles['smooth-scroll'])
      observer.disconnect()
    }
  }, [contentSelector, headingElements, rootMargin, threshold])

  useEffect(() => {
    const aside = asideRef.current
    if (!aside) return

    const ul = aside.querySelector('ul')!
    while (ul.firstChild) ul.removeChild(ul.firstChild)

    const container = contentSelector
      ? mainRef.current?.querySelector(contentSelector)
      : mainRef.current
    if (!container) {
      aside.classList.add('display-none')
      return
    }

    const headings = container.querySelectorAll<HTMLHeadingElement>(
      headingElements.join(',')
    )
    if (headings.length < minimumHeadingCount) {
      aside.classList.add('display-none')
      return
    }

    const primaryTagName = headingElements[0].toUpperCase()
    for (const heading of Array.from(headings)) {
      const clone = heading.cloneNode(true)

      // Make sure in-page nav does not add duplicate IDs to document
      clone.childNodes.forEach((child) => {
        if (child.nodeType !== Node.ELEMENT_NODE) return

        const childEl = child as HTMLElement
        childEl.id = ''
        childEl.querySelectorAll('[id]').forEach((el) => {
          el.id = ''
        })
      })

      const { id, tagName } = heading

      const a = document.createElement('a')
      a.href = `#${CSS.escape(id)}`
      a.dataset.id = id
      while (clone.firstChild) a.appendChild(clone.firstChild)

      const li = document.createElement('li')
      li.className = classnames('usa-in-page-nav__item', {
        'usa-in-page-nav__item--primary': tagName === primaryTagName,
      })

      li.appendChild(a)
      ul.appendChild(li)
    }

    aside.classList.remove('display-none')
  }, [content, contentSelector, headingElements, minimumHeadingCount])

  return (
    <div className="usa-in-page-nav-container" {...divProps}>
      <aside
        ref={asideRef}
        className={asideClasses}
        aria-label={title}
        data-testid="InPageNavigation">
        <nav className={navClasses} {...remainingNavProps}>
          <Heading className="usa-in-page-nav__heading" tabIndex={0}>
            {title}
          </Heading>
          <ul className="usa-in-page-nav__list"></ul>
        </nav>
      </aside>
      <main
        ref={mainRef}
        id="main-content"
        className={mainClasses}
        {...remainingMainProps}
        style={scrollOffset ? offsetStyle : undefined}>
        {content}
      </main>
    </div>
  )
}

export default InPageNavigation
