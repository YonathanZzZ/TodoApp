const Sequelize = require("sequelize");
const {DataTypes} = require("sequelize");
const HASH_LENGTH = 60;
console.log('env_vars in dbHandler before creating sequelize: ', process.env);
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql'
    }
);

sequelize.authenticate().then(() => {
    console.log('connection to database successfully established');
}).catch((error) => {
    console.error('Unable to connect to database, error: ', error);
});

// noinspection JSVoidFunctionReturnValueUsed
const User = sequelize.define("users", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    password: {
        type: DataTypes.CHAR(HASH_LENGTH),
        allowNull: false
    }

}, {
    timestamps: false
});

// noinspection JSVoidFunctionReturnValueUsed
const Task = sequelize.define("tasks", {
    id:{
        type: DataTypes.UUID,
        primaryKey: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

//define relationships
User.hasMany(Task, {
    foreignKey: 'email'
});
Task.belongsTo(User, {
    foreignKey: 'email'
});

sequelize.sync({alter: true}).then(() => {
    console.log('tables created successfully');
}).catch((error) => {
    console.log('failed to create tables, error: ', error);
});

//define functions to work with db
const addTaskToDB = (task) => {
    return Task.create(task);
};

const deleteTask = (taskID) => {
    return Task.destroy({
        where: {
            id: taskID
        }
    });
};

const updateTaskGeneric = (taskIdentifier, newTaskData) => {
    return Task.update(newTaskData, {
        where: taskIdentifier
    });
};

const getUserTasks = (email, done) => {
    console.log('type of variable done: ', typeof done);
    return Task.findAll({
        attributes: ['id' ,'content'],
        where: {
            email: email,
            done: done
        },
        raw: true
    });
};

const addUser = (email, password) => {
    return User.create({
        email: email,
        password: password
    });
};

const deleteUser = (email) => {
    return User.destroy({
        where: {
            email: email
        }
    });
};

const getUserPassword = async (email) => {

    const user = await User.findOne({where: {email: email}});
    if(!user){
        return false;
    }

    return user.password;
}

module.exports = {addTaskToDB, deleteTask, updateTaskGeneric, getUserTasks, addUser, getUserPassword, deleteUser};







