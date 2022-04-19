import React from 'react'

import StickySidebar from 'react-sticky-sidebar'
import 'react-sticky-sidebar/dist/index.css'

const App = () => {
  const renderSidebarContent = () => (
    <>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tempus id leo et aliquam. </p>

      <p>Proin consectetur ligula vel neque cursus laoreet. Nullam dignissim, augue at consectetur pellentesque.</p>

      <p>Metus ipsum interdum sapien, quis ornare quam enim vel ipsum.</p>

      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tempus id.</p>
    </>
  )

  const renderContent = () => (
    <>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tempus id leo et aliquam. Proin consectetur ligula vel neque cursus laoreet. Nullam dignissim, augue at consectetur pellentesque, metus ipsum interdum sapien, quis ornare quam enim vel ipsum.</p>

      <p>In congue nunc vitae magna tempor ultrices. Cras ultricies posuere elit. Nullam ultrices purus ante, at mattis leo placerat ac. Nunc faucibus ligula nec lorem sodales venenatis. Curabitur nec est condimentum, blandit tellus nec, semper arcu. Nullam in porta ipsum, non consectetur mi. Sed pharetra sapien nisl. Aliquam ac lectus sed elit vehicula scelerisque ut vel sem. Ut ut semper nisl.</p>

      <p>Curabitur rhoncus, arcu at placerat volutpat, felis elit sollicitudin ante, sed tempus justo nibh sed massa. Integer vestibulum non ante ornare eleifend. In vel mollis dolor.</p>
    </>
  )



  return (
    <>
      <header>
        <div className="container">
          <h1>Site Title</h1>
        </div>
      </header>

      <StickySidebar
        topSpacing={74}
        id="sticky-sidebar"
        sidebarId="sidebar"
        sidebarInnerId="sidebar__inner"
        content={renderContent}
        sidebarContent={renderSidebarContent} />

      <footer>
        <p>Very Tall Footer</p>
      </footer>
    </>
  )
}

export default App
