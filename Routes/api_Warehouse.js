exports.sendMyWarehouseList = async (req, res, pool) => {
    let connection = null;
    const user_id = req.user.member_id;
    let warehouses = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        const [warehouse_info] = await connection.query('SELECT E.warehouseID, E.warehouseName,' 
                                                    + ' E.address, E.infoComment,'
                                                    + ' ((SELECT IFNULL(SUM(C.area), 0)'
                                                    + ' FROM Contract C, Warehouse W'
                                                    + ' WHERE C.warehouseID = W.warehouseID'
                                                    + ' AND W.warehouseID = E.warehouseID)'
                                                    + ' / E.useableArea) * 100 AS used'
                                                    + ' FROM Warehouse E, Provider P'
                                                    + ' WHERE E.warehouseID = P.warehouseID'
                                                    + ' AND P.memberID = ?', [user_id]);
        
        for (const info of warehouse_info) {
            const [warehouse_images] = await connection.query('SELECT filename'
                                                        + ' FROM FileInfo F, Warehouse W, Provider P'
                                                        + ' WHERE F.warehouseID = W.warehouseID'
                                                        + ' AND W.warehouseID = P.warehouseID'
                                                        + ' AND P.memberID = ?'
                                                        + ' AND P.warehouseID = ?', [user_id, info.warehouseID]);
            const images_url = [];
            const base_url = process.env.BASE_URL;
            for (image of warehouse_images) {
                images_url.push(`${base_url}/Public/Upload/${image.filename}`);
            }

            warehouses.push({
                wid: info.warehouseID,
                name: info.warehouseName,
                address: info.address,
                info: info.infoComment,
                usage: Math.round(info.used),
                images: images_url
            });
        }

        res.status(200).json(warehouses);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    } finally {
        connection.release();
    }
}