import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import {TextField, Button, Grid, Container, InputLabel, MenuItem, Select, Checkbox} from '@mui/material';
import {useEffect, useState} from "react";
import Alert from '@mui/material/Alert';


const columns = [
    { field: 'UserID'},
    { field: 'Name', width: 250 },
    { field: 'Status'},
    { field: 'PartyRef'},
    { field: 'IsAdministrator'},
    { field: 'Password'},
    { field: 'LastPasswordUpdate'},
    { field: 'Creator'},
    { field: 'CreationDate'},
    { field: 'LastModifier'},
    { field: 'LastModificationDate'},
];

const User = () => {
    const baseUrl = 'http://127.0.0.1:5000'
    const apiUrl = baseUrl+'/user'
    const urlField = "Name"
    const pkField = "UserID"
    const listField = "users"
    const emptyRow = {UserID:"",Name:"",Status:'',PartyRef:'',IsAdministrator:'',Password:'',LastPasswordUpdate:'',Creator:null,CreationDate:null,LastModifier:null,LastModificationDate:null}
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [alertSeverity, setAlertSeverity] = useState("");
    const [alertMessage, setAlertMessage] = useState(null);
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(100);
    const [formData, setFormData] = React.useState(emptyRow);
    const [selectedRowId, setSelectedRowId] = React.useState(0);

    const apiUrlParty = baseUrl+'/party'
    const [partys, setPartys] = React.useState([]);

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
            const response1 = await axios.get(apiUrlParty, {headers: {pageSize: 10000,}});
            console.log("fetchSelects:",response1.data.partys)
            setPartys(response1.data.partys);
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
            <h1>User</h1>
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
                            <TextField label="UserID" name="UserID" value={formData?.UserID} onChange={handleChange} fullWidth variant="outlined"  InputLabelProps={{shrink:true}} disabled={true} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Name" name="Name" value={formData?.Name} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} disabled={formData?.[pkField]} />
                        </Grid>
                        <Grid item xs={12}><TextField label="Status" name="Status" value={formData?.Status} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}>
                            <InputLabel>PartyRef</InputLabel>
                            <Select label="PartyRef" name="PartyRef" value={formData?.PartyRef} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} >
                                {partys.map((row) => (<MenuItem key={row.PartyID} value={row.PartyID}>{row.LastName+' '+row.LastName}</MenuItem>))}
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            {/*<InputLabel>IsAdministrator</InputLabel>*/}
                            <TextField label="IsAdministrator" name="IsAdministrator" value={formData?.IsAdministrator} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}><TextField type="password" label="Password" name="Password" value={formData?.Password} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField label="LastPasswordUpdate" name="LastPasswordUpdate" value={formData?.LastPasswordUpdate} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }}  disabled={true}/></Grid>
                        <Grid item xs={12}><TextField label="Creator" name="Creator" value={formData?.Creator} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }}  disabled={true}/></Grid>
                        <Grid item xs={12}><TextField label="CreationDate" name="CreationDate" value={formData?.CreationDate} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }}  disabled={true}/></Grid>
                        <Grid item xs={12}><TextField label="LastModifier" name="LastModifier" value={formData?.LastModifier} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }}  disabled={true}/></Grid>
                        <Grid item xs={12}><TextField label="LastModificationDate" name="LastModificationDate" value={formData?.LastModificationDate} onChange={handleChange} fullWidth variant="outlined" InputLabelProps={{ shrink: true }}  disabled={true}/></Grid>
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

export default User;
