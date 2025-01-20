import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import {TextField, Button, Grid, Container, InputLabel, MenuItem, Select} from '@mui/material';
import {useEffect, useState} from "react";
import Alert from '@mui/material/Alert';


const columns = [
    { field: 'StorePositionID'},
    { field: 'Name', width: 250 },
    { field: 'Code'},
    { field: 'State'},
    { field: 'StoreRef'},
    { field: 'ParentRef'},
];

const StorePosition = () => {
    const baseUrl = 'http://127.0.0.1:5000'
    const apiUrl = baseUrl+'/storeposition'
    const urlField = "Name"
    const pkField = "StorePositionID"
    const listField = "storepositions"
    const emptyRow = {StorePositionID:"",Name:"",Code:"",State:'',StoreRef:'',ParentRef:''}
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [alertSeverity, setAlertSeverity] = useState("");
    const [alertMessage, setAlertMessage] = useState(null);
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(100);
    const [formData, setFormData] = React.useState(emptyRow);
    const [selectedRowId, setSelectedRowId] = React.useState(0);

    const apiUrlStore = baseUrl+'/store'
    const [stores, setStores] = React.useState([]);
    const apiUrlParent = baseUrl+'/storeposition'
    const [parents, setParents] = React.useState([]);

    useEffect(() => {
        if(alertMessage!=null){
            // setAlertSeverity(true);
            let timer = setTimeout(() => {
                showAlert("",null);
            }, 3000);
            return () => clearTimeout(timer)
        }
    }, [alertMessage]);

    const showAlert = (severity, message) => {
        console.log(severity, message);
        setAlertSeverity(severity);
        setAlertMessage(message);
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(apiUrl, {
                params: {},
                headers: {
                    page: page + 1, // API may use 1-based index for pagination
                    pageSize: pageSize,
                }
            });
            console.log("fetchData:",response)
            setData(response.data);
        } catch (error) {
            showAlert('error', 'Error fetching data:'+ error.message);  // Handle errors
        } finally {
            setLoading(false);
        }
    };

    const fetchSelects = async () => {
        setLoading(true);
        try {
            const response1 = await axios.get(apiUrlStore, {headers: {pageSize: 10000,}});
            setStores(response1.data.stores);
            const response2 = await axios.get(apiUrlParent, {headers: {pageSize: 10000,}});
            setParents(response2.data.storepositions);
        } catch (error) {
            showAlert('error', 'Error fetching data:'+ error.message);  // Handle errors
        } finally {
            setLoading(false);
        }
    };


    const postData = async (rowData) => {
        setLoading(true);
        try {
            let uid = rowData[urlField]
            delete rowData[pkField];
            delete rowData[urlField];
            const response = await axios.post(apiUrl+'/'+uid, rowData);
            showAlert('info', 'Adding Succeed');  // Handle errors
            setFormData(response.data);
            fetchData();
        } catch (error) {
            showAlert('error', 'Error adding data:'+ error.message);  // Handle errors
        } finally {
            setLoading(false);
        }
    };

    const patchData = async (rowData) => {
        setLoading(true);
        console.log(rowData);
        try {
            let uid = rowData.Name
            delete rowData.Name;
            const response = await axios.patch(apiUrl+'/'+uid, rowData);
            showAlert('info', 'Updating Succeed');
            setFormData(response.rowData);
            fetchData();
        } catch (error) {
            showAlert('error', 'Error updating data:'+ error.message);  // Handle errors
        } finally {
            setLoading(false);
        }
    };

    const deleteData = async (rowData) => {
        if(rowData) {
            console.log(rowData);
            setLoading(true);
            try {
                let uid = rowData.Name
                const response = await axios.delete(apiUrl+'/' + uid);
                showAlert('info', 'Delete Succeed');
                fetchData()
                handleNew()
            } catch (error) {
                showAlert('error','Error deleting data:' + error.message);  // Handle errors
            } finally {
                setLoading(false);
            }
        }
    };

    React.useEffect(() => {
        fetchData();
        fetchSelects();
    }, [page, pageSize]);

    const getRowById = (rowId) => {
        console.log(rowId)
        if(rowId.length>0){
            let foundRow = data[listField].find((row) => row[pkField]==rowId[0])
            console.log("getRowById:foundRow:"+JSON.stringify( foundRow))
            return foundRow
        }else{
            console.log("getRowById:null:"+JSON.stringify( emptyRow))
            return emptyRow
        }
    }
    const setRowSelectionModel = (rowId) => {
        console.log(rowId)
        if(rowId.length>0){
            setSelectedRowId(rowId[0])
        }else{
            setSelectedRowId(0)
        }
        console.log("setRowSelectionModel:selectedRow:"+JSON.stringify( selectedRowId))
        setFormData(getRowById(rowId))
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData( values => ({...values,  [name]: value}));
    }

    const handleNew = () => {
        setFormData(emptyRow);
        console.log("handleNew:formData:"+JSON.stringify( formData))
    };

    const handleSave = (event) => {
        event.preventDefault();
        if(!formData[pkField] || formData[pkField]==="")postData(formData);
        else patchData(formData)
    };

    const handleDelete = (event) => {
        event.preventDefault();
        deleteData(formData)
    };

    return (
        <div style={{ height: 300, width: '100%' }}>
            <h1>StorePosition</h1>
            <DataGrid
                getRowId={(row) => row[pkField]}
                rows={data[listField]}
                columns={columns}
                pageSize={pageSize}
                rowCount={100} // Total rows available from API, for pagination
                pagination
                paginationMode="server" // Inform the table that pagination is handled server-side
                loading={loading}
                page={page}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => setPageSize(newSize)}
                // onRowEditStart={}
                disableMultipleRowSelection={true}
                onRowSelectionModelChange={(newRow) => setRowSelectionModel(newRow)}
            />

            {alertSeverity!=="" ? <Alert severity={alertSeverity}>{alertMessage}</Alert> : <></> }
            <br/>
            <Container maxWidth="xs">
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="StorePositionID" name="StorePositionID" value={formData?.StorePositionID} onChange={handleChange} fullWidth variant="outlined"  InputLabelProps={{shrink:true}} disabled={true} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Name" name="Name" value={formData?.Name} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} disabled={formData?.[pkField]} />
                        </Grid>
                        <Grid item xs={12}><TextField label="Code" name="Code" value={formData?.Code} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField label="State" name="State" value={formData?.State} onChange={handleChange} fullWidth variant="outlined"  InputLabelProps={{ shrink: true }}/></Grid>
                        <Grid item xs={12}>
                            <InputLabel>StoreRef</InputLabel>
                            <Select label="StoreRef" name="StoreRef" value={formData?.StoreRef} onChange={handleChange} fullWidth variant="outlined"  InputLabelProps={{ shrink: true }}>
                                {stores.map((row) => (<MenuItem key={row.StoreID} value={row.StoreID}>{row.Name}</MenuItem>))}
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel>"ParentRef"</InputLabel>
                            <Select label="ParentRef" name="ParentRef" value={formData?.ParentRef} onChange={handleChange} fullWidth variant="outlined"  InputLabelProps={{ shrink: true }}>
                                {parents.map((row) => (<MenuItem key={row.StorePositionID} value={row.StorePositionID}>{row.Name}</MenuItem>))}
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={handleNew}>New</Button>&nbsp;
                            <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>&nbsp;
                            <Button variant="contained" color="primary" onClick={handleDelete}  disabled={!formData?.[pkField]}>Delete</Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </div>
    );
};

export default StorePosition;
