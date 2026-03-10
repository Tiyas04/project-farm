import UserModel from "@/models/user"

const GenerateAccessAndRefreshToken = async (id:any) => {
    const existingUser = await UserModel.findById(id)
    
    if(!existingUser){
        throw new Error("User not found")
    }
    
    const accessToken = await existingUser.generateAccessToken()
    const refreshToken = await existingUser.generateRefreshToken()

    existingUser.refreshToken = refreshToken
    await existingUser.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
}

export default GenerateAccessAndRefreshToken