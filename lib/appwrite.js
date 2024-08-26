import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.milbratheduardo.zsul',
    projectId: '66acd9e100124f502bd9',
    databaseId: '66acda31000cc877959d',
    userCollectionId: '66acda4a00054c720a90',
    alunoCollectionId: '66acda860023ccfb7f13',
    turmaCollectionId: '66acdac50024492e0523',
    chamadaCollectionId: '66acdaee000fcb0006c2',
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId) 
    .setPlatform(appwriteConfig.platform) 

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);

export const createUser = async (email,password,username,
    cpf,endereco,bairro) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username,
            cpf,
            endereco,
            bairro
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                userId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
                endereco,
                bairro,
                cpf
            }
        )

        return newUser;
    } catch (error) {
        console.log(Error);
        throw new Error(error);
    }
}


export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error) {
        throw new Error(error);
    }
}


export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('userId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export const getAllTurmas = async () => {
    try {
        const turmas = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.turmaCollectionId
        )

        return turmas.documents;
    } catch (error) {
        throw new Error(error);
    }
}


export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        throw new Error(error)
    }
}



