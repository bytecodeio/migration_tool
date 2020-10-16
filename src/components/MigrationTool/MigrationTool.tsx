 /* tslint:disable */
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual'
import React, { useContext, useEffect, useState } from "react"
import { useLocation } from 'react-router-dom'
import {
  Heading, Box, FieldCheckbox, List, Chip, Space,
  ListItem, Paragraph, InputText, Form, Select, SpaceVertical
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
// import {authHandler} from '../../utils/authHandler'
// import {sampleEnvironment} from '../../utils/sampleEnvironment'
export const MigrationTool = () => {
  const location = useLocation()
  const [routeData, setRouteData] = useState<any>({})
  const [messages, setMessages] = useState<string>("")

  const [instructions, setInstructions] = useState("Enter a target environment URL, API3 Key and Secret")
  const [projects, setProjects] = useState<Array<any>>([])
  const [environments, setEnvironments] = useState<Array<IEnvironment>>([{ name: "", uri: "", key: "", secret: "", token:"" }])
  const [isValidationSuccess, setIsValidationSuccess] = useState<Boolean>()
  const [openEnvironmentIndex, setOpenEnvironmentIndex] = useState<number | null>(0)
  const [fromEnvironmentIndex, setFromEnvironmentIndex] = useState<number>(0)
  const [targetEnvironmentIndex, setTargetEnvironmentIndex] = useState<number>(0)
  const [token, setToken] =useState<string>()
  const [sharedFolderSourceData, setSharedFolderSourceData] =useState<any>()
  const [sharedFolderTargetData, setSharedFolderTargetData] =useState<any>()

  const sdk = getCore40SDK

  // useEffect(() => {
  //   if (location.search || location.pathname.includes('?')) {
  //     const route = `${location.pathname}${location.search}`
  //     if (routeData.route !== route || !isEqual(routeData.routeState, location.state)) {
  //       setRouteData({ route, routeState: location.state })
  //       updateMessages(`location: ${location.pathname}${location.search} ${JSON.stringify(location.state)}`)
  //     }
  //   }
  // }, [location])

  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  // Get access to the extension SDK and the looker API SDK.
  const { extensionSDK, core40SDK } = extensionContext

  const sourceEnvironment = environments[fromEnvironmentIndex]
  const targetEnvironment = environments[targetEnvironmentIndex]
      
  const getToken = async (i: number, environment:IEnvironment) => {
    const result = await extensionSDK.serverProxy(
      `${environment.uri}/api/4.0/login`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body:
          `client_id=${environment.key}&client_secret=${environment.secret}`,
      }
    )
    console.log({ result })
    setEnvironmentAttribute(i, null,null,null,null,(result.body.access_token || ''))
    return result.status
  }

  const migrateSharedFolder = async () => {
    // get the root shared folder id from the target
    const originalTargetSharedFolder = await extensionSDK.serverProxy(
      `${targetEnvironment.uri}/api/4.0/folders/home`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${targetEnvironment.token}`,
        },
      }
    )
    const newTargetSharedFolderData: any = {
      parent_id: originalTargetSharedFolder.body.id,
      name: "New Migrated Shared Folder"
    }
    // put the new folder in the target
    const newTarget = await extensionSDK.serverProxy(
      `${targetEnvironment.uri}/api/4.0/folders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${targetEnvironment.token}`,
        },
        body: JSON.stringify(newTargetSharedFolderData)
      }
    )
    newTargetSharedFolderData.id = newTarget.body.id
    
    setSharedFolderTargetData(newTargetSharedFolderData)
    updateMessages("Successfully created new shared folder")
    // updateMessages(JSON.stringify(newTargetSharedFolderData))
  }

  const getSharedFolderClick = async (environment:IEnvironment) => {
    const folders = await extensionSDK.serverProxy(
      `${environment.uri}/api/4.0/folders/home`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${environment.token}`,
        },
      }
    )

    const children =  await extensionSDK.serverProxy(
      `${sourceEnvironment.uri}/api/4.0/folders/${folders.body.id}/children`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sourceEnvironment.token}`,
        },
      }
    )
    const child_ids = children.body.map((child:any)=> {return child.id})
    const newSharedFolderSourceData = {
      child_ids: child_ids,
      source_folder_id: folders.body.id,
      source_dashboard_ids: folders.body.dashboards.map(x => x.id),
      source_look_ids: folders.body.looks.map(x => x.id)
    }
    setSharedFolderSourceData(newSharedFolderSourceData)
    updateMessages("Shared folder source details:")
    // updateMessages(JSON.stringify(newSharedFolderSourceData))
  }

  const getSourceFolderData = async (id:number) => {
    const folders = await extensionSDK.serverProxy(
      `${sourceEnvironment.uri}/api/4.0/folders/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sourceEnvironment.token}`,
        },
      }
    )
    const children =  await extensionSDK.serverProxy(
      `${sourceEnvironment.uri}/api/4.0/folders/${id}/children`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sourceEnvironment.token}`,
        },
      }
    )
    const child_ids = children.body.map((child:any)=> {return child.id})
    const folderSourceData = {
      folder_name: folders.body.name,
      folder_id: folders.body.id,
      dashboard_ids: folders.body.dashboards.map(x => x.id),
      look_ids: folders.body.looks.map(x => x.id),
      child_ids: child_ids
    }
    return folderSourceData
  }

  const createNewFolder = async (parentId:number,folderName:string) => {
    const newTargetFolderData: any = {
      parent_id: parentId,
      name: folderName
    }
    const newFolder = await extensionSDK.serverProxy(
      `${targetEnvironment.uri}/api/4.0/folders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${targetEnvironment.token}`,
        },
        body: JSON.stringify(newTargetFolderData)
      }
    )
    return newFolder.body.id
  }

  const migrateAllChildrenOfShared = async () => {
    sharedFolderSourceData.child_ids.forEach((folderId:number) => {
      migrateAllFromFolder(folderId, sharedFolderTargetData.id)
    })
  }

  const migrateAllFromFolder = async (sourceFolderId:number, targetFolderParentId:number) => {
    const sourceFolderData = await getSourceFolderData(sourceFolderId)
    const { folder_name, folder_id, child_ids, dashboard_ids, look_ids } = sourceFolderData
    const newFolderId = await createNewFolder(targetFolderParentId, folder_name)
    migrateLooks(look_ids,newFolderId)
    migrateDashboards(dashboard_ids,newFolderId)
    child_ids.forEach((nextId:number) => {migrateAllFromFolder(nextId,newFolderId)})
  }

  
  const updateMessages = (message: string, error?: any) => {
    setMessages(prevMessages => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      const fullMessage = error ? `${message}\n${error}` : message
      return `${prevMessages}${maybeLineBreak}${fullMessage}`
    })
  }

  // const allProjectsFetch = async () => {
  //   try {
  //     const value = await sdk.ok(sdk.all_projects())
  //     const projectArray: Array<any> = []
  //     value.forEach((project: any) => {
  //       projectArray.push({ name: project.name || '', git_remote_url: project.git_remote_url || '', checked: true })
  //     })
  //     setProjects(projectArray)
  //   } catch (error) {
  //     updateMessages('Error getting projects', error)
  //   }
  // }

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
    try{ const response = await getToken(i, environment)
    if (response == 200) {
      console.log('success!')
      console.log(JSON.stringify(response))
      
      updateMessages(`Successfully connected to: ${environment.name}`)
    }
  }  catch(error) {
          console.error("An unexpected error occured:", error)
          updateMessages(`An unexpected error occured: ${error}`)
        }
  }
  const emptyEnvironment = { name: "", uri: "", key: "", secret: "", token:"" }
  const newEnvironment = () => {
    const newEnvironments = [...environments, emptyEnvironment]
    setEnvironments(newEnvironments)
    setOpenEnvironmentIndex(newEnvironments.length - 1)
  }

  const closeEnvironment = (i:number) => {
    setOpenEnvironmentIndex(null)
    testConnection(i)
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

  const setEnvironmentAttribute = (i: number, name: any, uri: any, key: any, secret: any, token: any=null) => {
    const newEnvironments = [
      ...environments.slice(0, i),
      Object.assign({}, environments[i], {
        name: name || environments[i].name,
        uri: uri || environments[i].uri,
        key: key || environments[i].key,
        secret: secret || environments[i].secret,
        token: token || environments[i].token
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
        <ExtensionButton size="small" onClick={() => closeEnvironment(i)}>Save</ExtensionButton>
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

  const instanceSelector = () => {
    const environmentOptions:Array<any> = environments.map((x,i) =>{
      return {value: i, label:x.name}
    })
  return(    <>
    Pull From: <Select
      name="Pull From"
      options={environmentOptions}
      onChange={(x)=> setFromEnvironmentIndex(x) }
    /><br/>
    Push To: <Select
      name="Pull From"
      options={environmentOptions}
      onChange={(x) => setTargetEnvironmentIndex(x) }
  />
    </>)
  }
  const contentMigration = () => {
    return (<>
    <SpaceVertical><ExtensionButton size="small" onClick={() => getSharedFolderClick(environments[fromEnvironmentIndex])}>Pull Shared Folder</ExtensionButton> 
      <ExtensionButton size="small" onClick={() => migrateSharedFolder()}>Create New Shared Folder In Target</ExtensionButton> 
      <ExtensionButton size="small" onClick={() => migrateLooks(sharedFolderSourceData.source_look_ids,sharedFolderTargetData.id)}>Migrate Shared Folder Looks</ExtensionButton> 
      <ExtensionButton size="small" onClick={() => migrateDashboards(sharedFolderSourceData.source_dashboard_ids,sharedFolderTargetData.id)}>Migrate Shared Folder Dashboards</ExtensionButton> 
      <ExtensionButton size="small" onClick={() => migrateAllChildrenOfShared()}>Migrate All Subfolders, Iteratively</ExtensionButton> 
    
    </SpaceVertical>
    </>)
  }
  const showInstances = location.pathname == '/instances'
  const showObjectDeploy = location.pathname == "/object_deploy"

  const migrateDashboards = async (ids:Array<number>,parent_folder_id:number) => {
    updateMessages("Migrating Dashboards.")
    
    // // TODO: Temporarily restricting this to 1 dash for troubleshooting purposes
    // ids=[ids[0]]
    
    ids.forEach(async id => {
      const dashboard = await extensionSDK.serverProxy(
      `${sourceEnvironment.uri}/api/4.0/dashboards/${id}`,
      { method: 'GET',
        headers: {Authorization: `Bearer ${sourceEnvironment.token}`,},}  
      )
        const {dashboard_elements, dashboard_filters, dashboard_layouts} = dashboard.body
        const source_queries = dashboard_elements.queries 
        const mungedDashboard = omit(dashboard.body,[
          'id', 'content_metadata_id', 'user_id', 'created_at', 'dashboard_elements',
          'dashboard_filters', 'dashboard_layouts', 'deleted_at', 'deleter_id', 
          'edit_uri', 'favorite_count', 'last_accessed_at', 'lookml_link_id', 'slug', 
          'view_count', 'folder', 'content_favorite_id', 'deleted', 'last_viewed_at'
        ])
        mungedDashboard.folder_id = parent_folder_id
        updateMessages("Creating new empty dashboard.")
        // updateMessages(JSON.stringify(dashboard.body, null, '\t'))
        const newDashboard = await extensionSDK.serverProxy(
            `${targetEnvironment.uri}/api/4.0/dashboards`,
            { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
              body: JSON.stringify(mungedDashboard)
            }
          )
          const newDashboardId = newDashboard.body.id
          updateMessages(`Successfully created new (empty) dashboard. ID=${newDashboardId}`)
 
        // We'll need to map element IDs for the layout!
        let dashboardElementMap = dashboard_elements.map((x:any)=> {
          return {
            'sourceId': x.id,
            'targetId': null
          }
        })

        // Now looping through each element, creating them inside the dashboard.
        await Promise.all(dashboard_elements.map(async (element:any,elementIndex:number) => {
          let elementQueryId = null   
          // Create query if necessary
          if (element.query_id) {
            const mungedQuery = omit(element.query,[ 
              'id', 'slug','client_id','share_url','expanded_share_url','url'
            ])
              // Now, to create a new Query!
            updateMessages("Creating new query for dashboard element.")
            // updateMessages(JSON.stringify(mungedQuery, null, '\t'))
            const newQuery = await extensionSDK.serverProxy(
                `${targetEnvironment.uri}/api/4.0/queries`,
                { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
                  body: JSON.stringify(mungedQuery)
                }
              )
              elementQueryId = newQuery.body.id
              updateMessages(`Successfully created new query. ID=${elementQueryId}`)
          }

          // Create element
          const mungedElement = omit(element,[
            'id', 'query', 'result_maker_id', 'result_maker', 'alert_count'
          ])
          mungedElement.dashboard_id = newDashboardId
          mungedElement.query_id = elementQueryId
          updateMessages(`Creating new element. Index=${elementIndex}`)
        
          const newElement = await extensionSDK.serverProxy(
            `${targetEnvironment.uri}/api/4.0/dashboard_elements`,
            { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
              body: JSON.stringify(mungedElement)
            }
          )
          updateMessages(`Successfully created new element. ID=${newElement.body.id}`)
        
          // New element created, adding it to the map
          dashboardElementMap[elementIndex].targetId = newElement.body.id

        }))
       
        updateMessages(`Successfully created new Dashboard with all it's elements. Now creating layout. ID=${newDashboard.body.id}`)
        // updateMessages(JSON.stringify(newDashboard, null, '\t'))
        
        const mungedLayout = dashboard_layouts[0]
        mungedLayout.dashboard_id = newDashboardId
        delete mungedLayout.id
        // yikes. the layout components are a mess, they are a nested array that needs mapped updates.
        const newLayoutComponents = mungedLayout.dashboard_layout_components.map((dlc:any)=>{
          const indexOfMatchingElement = dashboardElementMap.findIndex(x => x.sourceId == dlc.dashboard_element_id );  
          return {
            'dashboard_element_id': dashboardElementMap[indexOfMatchingElement].targetId,
            "row": dlc.row,
            "column": dlc.column,
            "width": dlc.width,
            "height": dlc.height,
            "deleted": dlc.deleted,
            "element_title": dlc.element_title,
            "element_title_hidden": dlc.element_title_hidden,
            "vis_type": dlc.vis_type
          }
        })
       
        mungedLayout.dashboard_layout_components = newLayoutComponents
        //  updateMessages(JSON.stringify(mungedLayout, null, '\t'))
        const newLayout = await extensionSDK.serverProxy(
          `${targetEnvironment.uri}/api/4.0/dashboard_layouts`,
          { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
            body: JSON.stringify(mungedLayout)
          }
        )
        updateMessages(`Successfully created new Dashboard layout. Now creating filters.`)

        const mungedFilters = dashboard_filters
        delete mungedFilters.id
        mungedFilters.dashboard_id = newDashboardId

        const newFilters = await extensionSDK.serverProxy(
          `${targetEnvironment.uri}/api/4.0/dashboard_filters`,
          { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
            body: JSON.stringify(mungedFilters)
          }
        )
        updateMessages(`Successfully created new Dashboard filters. That 'Dash is done!. ID=${newDashboardId}`)

      })
    
  }
  

  const migrateLooks = async (ids:Array<number>,parent_folder_id:number) => {
    updateMessages("Migrating Looks.")
    ids.forEach(async id => {
      const look = await extensionSDK.serverProxy(
      `${sourceEnvironment.uri}/api/4.0/looks/${id}`,
      { method: 'GET',
        headers: {Authorization: `Bearer ${sourceEnvironment.token}`,},}  
      )
        const mungedLook = omit(look.body,[
          'id','content_metadata_id','folder','query_id','query'
        ])
        const mungedQuery = omit(look.body.query,[ 
          'id', 'slug','client_id','share_url','expanded_share_url','url'
        ])
     
        // Now, to create a new Query!
      updateMessages("Creating new query.")
      // updateMessages(JSON.stringify(mungedQuery, null, '\t'))
      const newQuery = await extensionSDK.serverProxy(
          `${targetEnvironment.uri}/api/4.0/queries`,
          { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
            body: JSON.stringify(mungedQuery)
          }
        )
        const queryId = newQuery.body.id
        updateMessages(`Successfully created new query. ID=${queryId}`)
      
        updateMessages("Creating new Look.")
        mungedLook.query_id = queryId
        mungedLook.folder_id = parent_folder_id

        // updateMessages(JSON.stringify(mungedLook, null, '\t'))
        const newLook = await extensionSDK.serverProxy(
          `${targetEnvironment.uri}/api/4.0/looks`,
          { method: 'POST', headers: {Authorization: `Bearer ${targetEnvironment.token}`,},
            body: JSON.stringify(mungedLook)
          }
        )
        updateMessages(`Successfully created new look. ID=${newLook.body.id}`)
       
      })
    
  }

  return (
    <>
      <SpaceVertical>
        <Box display="flex" flexDirection="row">
        <Box
          width="75vw"
          m="large"
          p="large"
          border="1px solid black"
          borderRadius="4px"
        >
        
          {showObjectDeploy ? 
          <>
          {instanceSelector()}
          {contentMigration()}
          </>
          : null
          }
         {showInstances ? <>
          {instanceList()}
          <ExtensionButton size="small" onClick={newEnvironment}>New Instance</ExtensionButton>
          </>
         : null }
         
        </Box>
      </Box>

      <Box width="73vw"  
          m="large"
          >
        <StyledPre>{messages}</StyledPre>
        {(messages.length > 0) &&
          <ExtensionButton mt="small" variant="outline"
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
        }
      </Box>
      </SpaceVertical>
    </>
  )
}

const StyledPre = styled.pre`
  margin: 0 0 0 20px;
  border: 1px solid #c1c6cc;
  height: 100%;
  padding: 20px;
`
