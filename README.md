# react-sticky-sidebar

A React implementation of [sticky-sidebar](https://github.com/abouolia/sticky-sidebar)

> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/react-sticky-sidebar.svg)](https://www.npmjs.com/package/react-sticky-sidebar) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-sticky-sidebar
```

## Usage

```tsx
import React, { Component } from 'react'

import StickySidebar from 'react-sticky-sidebar'
import 'react-sticky-sidebar/dist/index.css'

const Example = () => {
  const renderSidebarContent = () => (<>{/* aside container content */}</>)

  const renderContent = () => (<>{/* main container content */}</>)
  
  return (
    <div className="my-page">
      <StickySidebar
        topSpacing={96}
        sidebarContent={renderSidebarContent}
        content={renderContent}
      />
    </>
  )
}
```

## License

MIT © [tchesa](https://github.com/tchesa)
