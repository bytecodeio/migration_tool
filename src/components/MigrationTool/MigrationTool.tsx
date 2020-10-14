
import isEqual from 'lodash/isEqual'
import React, { useContext, useEffect, useState } from "react"
import { useLocation } from 'react-router-dom'
import { Heading, Box, FieldCheckbox, List,
   ListItem, Paragraph, InputText, Form, Button } from "@looker/components"
import styled from "styled-components"
import { ExtensionButton } from "../ExtensionButton"
import { IEnvironment } from "./types"
import {
  ExtensionContext,
  ExtensionContextData,
  getCore40SDK
} from "@looker/extension-sdk-react"

export const MigrationTool = () => {
  const location = useLocation()
  const [routeData, setRouteData] = useState<any>({})
  const [messages, setMessages] = useState<string>("")

  const [instructions, setInstructions] = useState("Enter a target environment URL, API3 Key and Secret")
  const [projects, setProjects] = useState<Array<any>>([])
  const [localEnvironment, setLocalEnvironment] = useState<IEnvironment>()
  const [productionEnvironment, setProductionEnvironment] = useState<IEnvironment>()
  const [isValidationSuccess, setIsValidationSuccess] = useState<Boolean>()
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true)
  const [connectionURI, setConnectionURI] = useState<string>()
  const [connectionKey, setConnectionKey] = useState<string>()
  const [connectionSecret, setConnectionSecret] = useState<string>()

  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.core40SDK

  useEffect(() => {
    if (!projects || projects.length == 0) {
      allProjectsFetch()
    }
  })

  useEffect(() => {
    if (location.search || location.pathname.includes('?')) {
      const route = `${location.pathname}${location.search}`
      if (routeData.route !== route || !isEqual(routeData.routeState, location.state)) {
        setRouteData({ route, routeState: location.state })
        updateMessages(`location: ${location.pathname}${location.search} ${JSON.stringify(location.state)}`)
      }
    }
  }, [location])

  const updateMessages = (message: string, error?: any) => {
    setMessages(prevMessages => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      const fullMessage = error ? `${message}\n${error}` : message
      return `${prevMessages}${maybeLineBreak}${fullMessage}`
    })
  }

  const allProjectsFetch = async () => {
    try {
      const value = await sdk.ok(sdk.all_projects())
      const projectArray: Array<any> = []
      value.forEach((project: any) => {
        projectArray.push({ name: project.name || '', git_remote_url: project.git_remote_url || '', checked: true })
      })
      setProjects(projectArray)
    } catch (error) {
      updateMessages('Error getting projects', error)
    }
  }

  const clickProjectCheckbox = (i: number) => {
    const newProjects = [
      ...projects.slice(0, i),
      Object.assign({}, projects[i], {
        checked: !projects[i].checked
      }),
      ...projects.slice(i + 1)]
    setProjects(newProjects)
  }

  const connectionForm = (
    <Form>
      <InputText
      label= "Connection URI"
      placeholder="Enter an api URI. Ex: company.cloud.looker.com:1999"
      value={connectionURI}
      onChange={(x: any) => setConnectionURI(x.value)}
    />
    <InputText
      label= "Connection APIv3 Key"
      placeholder="Enter an APIv3 Key"
      value={connectionKey}
      onChange={(x: any) => setConnectionKey(x.value)}
    />
    <InputText
      label= "Connection APIv3 Secret"
      placeholder="Enter an APIv3 Secret"
      value={connectionSecret}
      onChange={(x: any) => setConnectionSecret(x.value)}
    />
    <Button onClick={()=>testConnection()}>Submit</Button>
    </Form>
  )

  const testConnection = () => {
    console.log(connectionURI )
  }
  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <>
      <Heading as="h1" mt="xlarge">Migration Tool</Heading>
      <Box display="flex" flexDirection="row">
        {/* <Box display="flex" flexDirection="column" width="50%" maxWidth='30vw'>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={allConnectionsClick}
          >
            All connections (get method)
          </ExtensionButton>
         
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={allGroupsClick}
          >
            All groups (get method)
          </ExtensionButton>

          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={inlineQueryClick}
          >
            Inline query (post method)
          </ExtensionButton>
         
        </Box> */}
        <Box
          width="40%"
          m="large"
          p="large"
          maxWidth='45vw'
          border="1px solid black"
          borderRadius="4px"
        >
          <Heading as="h2">Current Environment</Heading>
          <Paragraph>Choose which projects you wish to migrate.</Paragraph>
          <List>

            {
              projects.map((x, i) => {
                return (
                  <ListItem>
                    <FieldCheckbox name={x.name} label={x.name} id={i} checked={x.checked}
                      onChange={() => clickProjectCheckbox(i)} />
                  </ListItem>
                )
              })}
          </List>
        </Box>
        <Box
          width="45%"
          m="large"
          p="large"
          maxWidth='45vw'
          border="1px solid black"
          borderRadius="4px"
        >
          <Heading as="h2">Target Environment</Heading>
          <Paragraph>{instructions}</Paragraph>
          {isFormVisible && connectionForm}
        </Box>
      </Box>

      <Box width="90%" pr="large" maxWidth='90vw'>
        <StyledPre>{messages}</StyledPre>
        {(messages.length > 0) &&
          <ExtensionButton mt="small" variant="outline"
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
        }
      </Box>
    </>
  )
}

const StyledPre = styled.pre`
  margin: 0 0 0 20px;
  border: 1px solid #c1c6cc;
  height: 100%;
  padding: 20px;
`
