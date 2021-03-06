var CheckPoint = sequelize.define(
    'check_point',
    {
        title: {type: Sequelize.STRING, allowNull: false},
        type:  {type: Sequelize.ENUM('TC','RA','test', 'exam', 'attestation'), allowNull: false},
        start: {type: Sequelize.DATE, allowNull: false},
        end: {type: Sequelize.DATE, allowNull: false},
        description: {type: Sequelize.TEXT, allowNull: true},
        test_config: {type: Sequelize.JSON, allowNull: true}
    },
    {
        tableName: 'check_points',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        deletedAt: 'deleted',
    }
);

module.exports = CheckPoint;
