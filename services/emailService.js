import nodemailer from 'nodemailer'
import { google } from 'googleapis'

const Oauth2 = google.auth.OAuth2

export const sendEmail = async (email, code) => {
    try {
        const client = new Oauth2( 
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
         )
        client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        })
        const accessToken = await client.getAccessToken()
        const transporte = nodemailer.createTransport( {
            service: 'gmail',
            auth : {
                user: 'catrielcirullidev@gmail.com',
                type: 'OAuth2',
                clientId : process.env.CLIENT_ID,
                clientSecret : process.env.CLIENT_SECRET,
                refreshToken : process.env.REFRESH_TOKEN,
                accessToken : accessToken
            },
            tls: {
                rejectUnauthorized : false
            }
        })
    
        const emailOptions = {
            from: 'catrielcirullidev@gmail.com',
            to: email,
            subject: 'Verify account',
            html: `
                <h1> API MOVIES MH </h1>
                <a href="http://localhost:5173/verify?code=${code}"> verify account </a>
            `
        }
    
        transporte.sendMail( emailOptions, (err, info) => {
            if( err ){
                console.log(err)
            }else{
                console.log('Email enviado con exito')
            }
        } )
    } catch (error) {
        console.log("error catch:", error)
    }

}
