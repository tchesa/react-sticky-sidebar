import * as React from 'react'
import styles from './styles.module.css'
import StickySidebarImplementation from './sticky-sidebar'

export type Props = {
  bottomSpacing?: number
  content?: () => JSX.Element
  id?: string
  sidebarContent?: () => JSX.Element
  sidebarId?: string
  sidebarInnerId?: string
  topSpacing?: number
}

const StickySidebar = ({
  bottomSpacing = 0,
  content,
  id = 'container',
  sidebarContent,
  sidebarId = 'sidebar',
  sidebarInnerId = 'sidebar-inner',
  topSpacing = 0
}: Props) => {
  const sidebarImplementation = React.useRef<StickySidebarImplementation>(
    new StickySidebarImplementation(`#${sidebarId}`, {
      containerSelector: `#${id}`,
      innerWrapperSelector: `#${sidebarInnerId}`,
      topSpacing: topSpacing,
      bottomSpacing: bottomSpacing
    })
  )

  React.useEffect(() => {
    sidebarImplementation.current = new StickySidebarImplementation(
      `#${sidebarId}`,
      {
        containerSelector: `#${id}`,
        innerWrapperSelector: `#${sidebarInnerId}`,
        topSpacing: topSpacing,
        bottomSpacing: bottomSpacing
      }
    )
  }, [id, sidebarId, sidebarInnerId])

  return (
    <div id={id} className={`sticky-sidebar ${styles.stickySidebar}`}>
      <div
        id={sidebarId}
        className={`sticky-sidebar__sidebar ${styles.sidebar}`}
      >
        <div
          id={sidebarInnerId}
          className={`sticky-sidebar__sidebar-inner ${styles.sidebarInner}`}
        >
          {sidebarContent?.()}
        </div>
      </div>
      <div className='sticky-sidebar__content'>{content?.()}</div>
    </div>
  )
}

export default StickySidebar
