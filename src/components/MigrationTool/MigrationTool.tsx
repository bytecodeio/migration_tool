
import isEqual from 'lodash/isEqual'
import React, { useContext, useEffect, useState } from "react"
import { useLocation } from 'react-router-dom'
import {
  Heading, Box, FieldCheckbox, List, Chip, Space,
  ListItem, Paragraph, InputText, Form
} from "@looker/components"
import styled from "styled-components"
import { ExtensionButton } from "../ExtensionButton"
import { IEnvironment } from "./types"
import {
  ExtensionContext,
  ExtensionContextData,
  getCore40SDK
} from "@looker/extension-sdk-react"
// import {lookerAuth} from "../../utils/login-popup"


export const MigrationTool = () => {
  const location = useLocation()
  const [routeData, setRouteData] = useState<any>({})
  const [messages, setMessages] = useState<string>("")

  const [instructions, setInstructions] = useState("Enter a target environment URL, API3 Key and Secret")
  const [projects, setProjects] = useState<Array<any>>([])
  const [environments, setEnvironments] = useState<Array<IEnvironment>>([{ name: "", uri: "", key: "", secret: "" }])
  const [isValidationSuccess, setIsValidationSuccess] = useState<Boolean>()
  const [openEnvironmentIndex, setOpenEnvironmentIndex] = useState<number | null>(0)
 
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.core40SDK

  // useEffect(() => {
  //   if (!projects || projects.length == 0) {

  //     allProjectsFetch()
  //   }
  // })

  // useEffect(() => {
  //   if (location.search || location.pathname.includes('?')) {
  //     const route = `${location.pathname}${location.search}`
  //     if (routeData.route !== route || !isEqual(routeData.routeState, location.state)) {
  //       setRouteData({ route, routeState: location.state })
  //       updateMessages(`location: ${location.pathname}${location.search} ${JSON.stringify(location.state)}`)
  //     }
  //   }
  // }, [location])

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

  const testConnection = async (i:number) => {
    const environment = environments[i]
    // initialize(environment)
    
  }

  

  const emptyEnvironment = { name: "", uri: "", key: "", secret: "" }

  const newEnvironment = () => {
    const newEnvironments = [...environments, emptyEnvironment]
    setEnvironments(newEnvironments)
    setOpenEnvironmentIndex(newEnvironments.length - 1)
  }

  const closeEnvironment = () => {
    setOpenEnvironmentIndex(null)
  }
  const openEnvironment = (i: number) => {
    setOpenEnvironmentIndex(i)
  }

  const deleteEnvironment = (i: number) => {
    const newEnvironments = [
      ...environments.slice(0, i),
      ...environments.slice(i + 1)]
    setEnvironments(newEnvironments)
  }

  const setEnvironmentAttribute = (i: number, name: any, uri: any, key: any, secret: any) => {
    const newEnvironments = [
      ...environments.slice(0, i),
      Object.assign({}, environments[i], {
        name: name || environments[i].name,
        uri: uri || environments[i].uri,
        key: key || environments[i].key,
        secret: secret || environments[i].secret
      }),
      ...environments.slice(i + 1)]
    setEnvironments(newEnvironments)
  }
  const setEnvironmentName = (i: number, value: string) => {
    setEnvironmentAttribute(i, value, null, null, null)
  }
  const setEnvironmentURI = (i: number, value: string) => {
    setEnvironmentAttribute(i, null, value, null, null)
  }
  const setEnvironmentKey = (i: number, value: string) => {
    setEnvironmentAttribute(i, null, null, value, null)
  }
  const setEnvironmentSecret = (i: number, value: string) => {
    setEnvironmentAttribute(i, null, null, null, value)
  }

  const connectionForm = (i: number) => {

    console.log(JSON.stringify(environments))

    return (
      <>
        <Form>
          <InputText
            key="name"
            label="Environment Name"
            placeholder="Enter a name. Ex: Dev, Stage, Prod"
            value={environments[i].name}
            onChange={(x: any) =>
              setEnvironmentName(i, x.target.value)
            }
          />
          <InputText
            key="URI"
            label="URI"
            placeholder="Enter an api URI. Ex: company.cloud.looker.com:1999"
            value={environments[i].uri}
            onChange={(x: any) => setEnvironmentURI(i, x.target.value)}
          />
          <InputText
            key="key"
            label="APIv3 Key"
            placeholder="Enter an APIv3 Key"
            value={environments[i].key}
            onChange={(x: any) => setEnvironmentKey(i, x.target.value)}
          />
          <InputText
            key="secret"
            label="APIv3 Secret"
            placeholder="Enter an APIv3 Secret"
            value={environments[i].secret}
            onChange={(x: any) => setEnvironmentSecret(i, x.target.value)}
          />
        </Form>
        <ExtensionButton size="small" onClick={closeEnvironment}>Save</ExtensionButton>
        <ExtensionButton size="small" onClick={() => testConnection(i)}>Test</ExtensionButton> 
        <br/>
      </>
    )
  }

  const instanceList = () => (
    <> {
      environments.map((env, i: number) => {
        if (i === openEnvironmentIndex) {
          return connectionForm(i)
        } else if (env.name && env.name.length > 0) {
          return (<>
            <Space gap="xxsmall"><Chip fontSize="xxlarge" onDelete={() => deleteEnvironment(i)}>{env.name} </Chip>
            <ExtensionButton size="small" onClick={() => setOpenEnvironmentIndex(i)}>Edit</ExtensionButton> </Space>
          </>)
        } else return 
      })
    } </>
  )

  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <>
      <Box display="flex" flexDirection="row">

        {/* <Box
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
                  <ListItem key={i}>
                    <FieldCheckbox name={x.name} label={x.name} id={i} checked={x.checked}
                      onChange={() => clickProjectCheckbox(i)} />
                  </ListItem>
                )
              })}
          </List>
        </Box> */}
        <Box
          width="75vw"
          m="large"
          p="large"
          border="1px solid black"
          borderRadius="4px"
        >
          {/* <Heading as="h2">Target Environment</Heading>
          <Paragraph>{instructions}</Paragraph> */}
          {instanceList()}
          <ExtensionButton size="small" onClick={newEnvironment}>New Instance</ExtensionButton>
        </Box>
      </Box>

      {/* <Box width="90%" pr="large" maxWidth='90vw'>
        <StyledPre>{messages}</StyledPre>
        {(messages.length > 0) &&
          <ExtensionButton mt="small" variant="outline"
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
        }
      </Box> */}
    </>
  )
}

const StyledPre = styled.pre`
  margin: 0 0 0 20px;
  border: 1px solid #c1c6cc;
  height: 100%;
  padding: 20px;
`
