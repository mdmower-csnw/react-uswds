import React from 'react'
import { screen, render, getByRole, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { InPageNavigation } from './InPageNavigation'
import { HeadingLevel } from '../../types/headingLevel'
import { CONTENT } from './content'
import styles from './InPageNavigation.module.scss'

describe('InPageNavigation component', () => {
  const props = {
    content: CONTENT,
    headingLevel: 'h1' as HeadingLevel,
    title: 'What do we have <i>here</i>?',
  }

  const setup = (plain?: boolean, headingElements?: HeadingLevel[]) => {
    const utils = plain
      ? render(<InPageNavigation content={props.content} />)
      : render(
          <InPageNavigation
            content={props.content}
            headingLevel={props.headingLevel}
            title={props.title}
            headingElements={headingElements}
          />
        )
    const nav = screen.getByTestId('InPageNavigation')
    const user = userEvent.setup()
    return {
      nav,
      user,
      ...utils,
    }
  }

  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    window.IntersectionObserver = mockIntersectionObserver
  })

  it('renders without errors', () => {
    const { nav } = setup(true)
    expect(nav).toBeInTheDocument()
    const heading = getByRole(nav, 'heading', {
      level: 4,
      name: 'On this page',
    })
    expect(heading).toBeInTheDocument()
    expect(document.querySelector('html')).toHaveClass(styles['smooth-scroll'])
  })

  it('sets the heading and title', () => {
    const { nav } = setup()
    const heading = getByRole(nav, 'heading', {
      level: Number(props.headingLevel.slice(-1)),
      name: props.title,
    })
    expect(heading).toBeInTheDocument()
  })

  it('does not render if minimum number of headings is unmet', () => {
    const screen = render(
      <InPageNavigation
        content={props.content}
        headingLevel={props.headingLevel}
        title={props.title}
        headingElements={['h1']}
      />
    )
    expect(screen.queryByTestId('InPageNavigation')).not.toBeInTheDocument()
  })

  it('finds nested headings', () => {
    const { nav } = setup()
    expect(
      within(nav).getByRole('link', { name: 'Volutpat condimentum' })
    ).toBeInTheDocument()
  })

  describe('lists the right heading types if', () => {
    it('is undefined', () => {
      const { nav } = setup(true)
      const contentHeadingsTwo = screen.getAllByRole('heading', { level: 2 })
      const contentHeadingsThree = screen.getAllByRole('heading', { level: 3 })
      const contentHeadings = contentHeadingsTwo.concat(contentHeadingsThree)
      const headingLinks = within(nav).getAllByRole('link')
      expect(contentHeadings.length).toBe(headingLinks.length)
    })

    it('is defined', () => {
      const { nav } = setup(false, ['h2' as HeadingLevel])
      const contentHeadingsTwo = screen.getAllByRole('heading', { level: 2 })
      const headingLinks = within(nav).getAllByRole('link')
      expect(contentHeadingsTwo.length).toBe(headingLinks.length)
    })
  })
})
