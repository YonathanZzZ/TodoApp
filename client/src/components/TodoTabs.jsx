import { Box, Tab, Tabs } from "@mui/material"

const TodoTabs = ({tabIndex, setTabIndex}) => {
    
  const handleTabChange = (event, index) => {
    setTabIndex(index);
  };
    
    return(
        <Box className="tabs-box">
                        <Tabs value={tabIndex} onChange={handleTabChange}>
                          <Tab label="Todo" />
                          <Tab label="Done" />
                        </Tabs>
                      </Box>
    )
}

export default TodoTabs;