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

import { Box, MenuGroup, MenuItem, MenuItemProps } from "@looker/components"
import * as React from "react"
import { Link as RouterLink, LinkProps } from "react-router-dom"
import styled from "styled-components"
import { SidebarProps } from "./"
import omit from "lodash/omit"
import { ROUTES } from '../../App'

export const Sidebar: React.FC<SidebarProps> = ({ route }) => {
  return (
    <Box display="flex" flexDirection="column" width="20%"maxWidth='20vw'>
      <MenuGroup type="none" mt="xsmall">
        <StyledRouterLink to={ROUTES.INSTANCES_ROUTE}>
          <MenuItem icon="LogoRings" current={route === ROUTES.INSTANCES_ROUTE}>
            Instances
          </MenuItem>
        </StyledRouterLink>
        
        <StyledRouterLink to={ROUTES.CODE_DEPLOY_ROUTE}>
          <MenuItem icon="Code" current={route.startsWith(ROUTES.CODE_DEPLOY_ROUTE)}>
           Code Deploy
          </MenuItem>
        </StyledRouterLink>
       
        <StyledRouterLink to={ROUTES.OBJECT_DEPLOY_ROUTE}>
          <MenuItem icon="ChartPie" current={route.startsWith(ROUTES.OBJECT_DEPLOY_ROUTE)}>
           Object Deploy
          </MenuItem>
        </StyledRouterLink>

        <StyledRouterLink to={ROUTES.CONTENT_VALIDATOR_ROUTE}>
          <MenuItem icon="Validate" current={route.startsWith(ROUTES.CONTENT_VALIDATOR_ROUTE)}>
           Content Validator
          </MenuItem>
        </StyledRouterLink>

        <StyledRouterLink to={ROUTES.EXTERNAL_API_ROUTE}>
          <MenuItem icon="Validate" current={route.startsWith(ROUTES.EXTERNAL_API_ROUTE)}>
           External Calls
          </MenuItem>
        </StyledRouterLink>
      </MenuGroup>
    </Box>
  )
}

const StyledRouterLinkInner: React.FC<LinkProps & MenuItemProps> = props => (
  <RouterLink {...omit(props, "customizationProps")} />
)

const StyledRouterLink = styled(StyledRouterLinkInner)`
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`
