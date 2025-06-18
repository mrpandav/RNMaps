import { StyleSheet } from 'react-native';

//! convert in ts

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',  
    
  },
   main: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
   
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  buttonSuccess: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    color: '#007bff',
    textAlign: 'center',
  },
  linkSuccess: {
    marginTop: 15,
    color: '#28a745',
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  map: {
    width: 400,
    height: 600,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  routeItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  timestamp: {
    color: '#555',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    margin: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 16,
    color: '#555',
  },
  box: {
    width: 180,
    height: 80,
    backgroundColor: '#007bff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  boxText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  flex:{
    flex:1,
  },
  livestyle:{
    backgroundColor:'red',
    color:'#fff',
    // height:50,
    width:110,
  },
   liveTag: {
  backgroundColor: 'red',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
  marginTop: 5,
  alignSelf: 'flex-start',
},
liveText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12,
},

});
