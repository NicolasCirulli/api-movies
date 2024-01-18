const userDTO = ( obj ) => {
        return {
               name : obj.name,
               email : obj.email,
               api_key: obj.apiKey || ""
        }
}

export default userDTO