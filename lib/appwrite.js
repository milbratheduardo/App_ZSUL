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
    eventoCollectionId: '66db57280002bca07979',
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId) 
    .setPlatform(appwriteConfig.platform) 

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);

    export const createUserProfessor = async (email, password, username, cpf, whatsapp) => {
        try {
            const newAccount = await account.create(
                ID.unique(),
                email,
                password
            );
    
            if (!newAccount) throw new Error("Account creation failed");
    
            const avatarUrl = avatars.getInitials(username);
    
            await signIn(email, password);
    
            const newUserProfessor = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                {
                    userId: newAccount.$id,
                    email,
                    username,
                    avatar: avatarUrl,
                    whatsapp,
                    cpf,
                    role: 'professor'
                }
            );
    
            return newUserProfessor;
        } catch (error) {
            console.error("Error in createUserProfessor:", error);
            throw new Error(error.message);
        }
    };



export const createUserResponsavel = async (email,password,username,
    cpf,endereco, bairro, rg, whatsapp, role) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUserResponsavel = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                userId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
                whatsapp,
                cpf,
                endereco,
                bairro,
                rg,
                role: 'responsavel'
            }
        )

        return newUserResponsavel;
    } catch (error) {
        console.log(Error);
        throw new Error(error);
    }
}

export const createAluno = async (email, password, username, nascimento, rg, escola, ano, whatsapp, createdByUsername, createdByUserId) => {
    try {
        let newAccount = null;
        let avatarUrl = '';

        if (email && password) {
            newAccount = await account.create(
                ID.unique(),
                email,
                password
            );

            if (!newAccount) throw new Error('Falha ao criar conta');

            avatarUrl = avatars.getInitials(username);

            await signIn(email, password);
        }

        const documentData = {
            email: email || null,
            username,
            avatar: avatarUrl || null,
            nascimento,
            rg,
            escola,
            ano,
            whatsapp,
            createdByUsername,
            createdByUserId,    
            role: 'aluno'
        };

        
        if (newAccount) {
            documentData.userId = newAccount.$id;
        }

        const newUserAluno = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            ID.unique(),
            documentData
        );

        return newUserAluno;
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
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

export const getAlunosByUserId = async (userId) => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            [
                Query.equal('createdByUserId', userId) 
            ]
        );

        return alunos.documents;
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar alunos.');
    }
};


export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        throw new Error(error)
    }
}


export const createTurma = async (title, Qtd_Semana, Dia1, Dia2, Dia3, Local, MaxAlunos, Horario_de_inicio) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.turmaCollectionId, 
        ID.unique(), 
        {
          title,
          Qtd_Semana,
          Dia1,
          Dia2,
          Dia3,
          Local,
          MaxAlunos,
          Horario_de_inicio
        }
      );
      return response;
    } catch (error) {
      throw new Error("Erro ao criar turma: " + error.message);
    }
  };

  export const createEvent = async (Title, Date_event, Description, Hora_event) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.eventoCollectionId, 
        ID.unique(), 
        {
          Title,
          Date_event,
          Description,
          Hora_event
        }
      );
      return response;
    } catch (error) {
      throw new Error("Erro ao criar evento: " + error.message);
    }
  };


  export const getAllEvents = async () => {
    try {
        const events = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId
        )

        return events.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAllAlunos = async () => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId
        )

        return alunos.documents;
    } catch (error) {
        throw new Error(error);
    }
}


