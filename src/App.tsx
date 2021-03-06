/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { Sidebar } from "./components/Sidebar"
import { MigrationTool } from "./components/MigrationTool"
import { CoreSDKFunctions } from "./components/CoreSDKFunctions"
import { ApiFunctions } from "./components/ApiFunctions"
import React, { useState } from "react"
import { Switch, Route, Redirect } from "react-router-dom"
import { theme, Box, GlobalStyle, Heading } from "@looker/components"
import styled, { ThemeProvider } from "styled-components"
import { ExtensionProvider } from "@looker/extension-sdk-react"
import { EmbedDashboard } from "./components/Embed"
import { EmbedExplore } from "./components/Embed/EmbedExplore"
import { EmbedLook } from "./components/Embed/EmbedLook"
import { ExternalApiFunctions } from "./components/ExternalApiFunctions"
import { MiscFunctions } from "./components/MiscFunctions"
import { hot } from "react-hot-loader/root"

interface AppProps {
}

export enum ROUTES {
  INSTANCES_ROUTE = "/instances",
  CODE_DEPLOY_ROUTE = "/code_deploy",
  OBJECT_DEPLOY_ROUTE = "/object_deploy",
  CONTENT_VALIDATOR_ROUTE = "/content_validator",
  EXTERNAL_API_ROUTE = "/external_api"
}

export const App: React.FC<AppProps> = hot(() => {
  const [route, setRoute] = useState("")
  const [routeState, setRouteState] = useState()

  const onRouteChange = (route: string, routeState?: any) => {
    setRoute(route)
    setRouteState(routeState)
  }

  return (
    <ExtensionProvider onRouteChange={onRouteChange}>
      <ThemeProvider theme={theme}>
        <>
          <GlobalStyle />
          
          <Layout>
            <Heading as="h1" mt="xlarge">Migration Tool</Heading>
            <Box display="flex" flexDirection="row">
              <Sidebar route={route} routeState={routeState}/>
            <Switch>
                <Route path={ROUTES.INSTANCES_ROUTE}>
                  <MigrationTool />
                </Route>
                
                <Route path={ROUTES.EXTERNAL_API_ROUTE}>
                  <ExternalApiFunctions />
                </Route>
                
                <Redirect to={ROUTES.INSTANCES_ROUTE} />
            </Switch>
              
              </Box>
          </Layout>
          {/* <Layout>
            <Sidebar route={route} routeState={routeState}/>
            <Box>
              <Switch>
                <Route path={ROUTES.API_ROUTE}>
                  <ApiFunctions />
                </Route>
                <Route path={[ROUTES.MIGRATION_ROUTE, `${ROUTES.CORESDK_ROUTE}?test=abcd`]}>
                  <MigrationUtility />
                </Route>
                <Route path={[ROUTES.CORESDK_ROUTE]}>
                  <CoreSDKFunctions />
                </Route>
                <Route path={ROUTES.EMBED_DASHBOARD}>
                  <EmbedDashboard />
                </Route>
                <Route path={ROUTES.EMBED_EXPLORE}>
                  <EmbedExplore />
                </Route>
                <Route path={ROUTES.EMBED_LOOK}>
                  <EmbedLook />
                </Route>
                <Route path={ROUTES.EXTERNAL_API_ROUTE}>
                  <ExternalApiFunctions />
                </Route>
                <Route path={ROUTES.MISC_ROUTE}>
                  <MiscFunctions />
                </Route>
                <Redirect to={ROUTES.API_ROUTE} />
              </Switch>
            </Box>
          </Layout>*/}
        </>
      </ThemeProvider>
    </ExtensionProvider>
  )
})

export const Layout = styled(Box)`
  display: grid;
  grid-gap: 20px;
  margin-left: 20px;
  grid-template-columns: auto;
  width: 100vw;
`
