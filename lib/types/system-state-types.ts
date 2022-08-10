export class SystemState {
    accessRights: unknown[] = [];
    allProperties: ResourceParam[] = [];
    analyticsEngines: GenericResource[] = [];
    analyticsPlugins: GenericResource[] = [];
    cameraHistory: CameraHistory[] = [];
    cameraUserAttributesList: CameraUserAttributes[] = [];
    cameras: Camera[] = [];
    discoveryData: unknown[] = [];
    layoutTours: unknown[] = [];
    layouts: Layout[] = [];
    licenses: License[] = [];
    resStatusList: ResourceStatus[] = [];
    resourceTypes: ResourceTypes[] = [];
    rules: Rule[] = [];
    servers: Server[] = [];
    serversUserAttributesList: ServersUserAttributes[] = [];
    storages: Storage[] = [];
    userRoles: unknown[] = [];
    users: User[] = [];
    videowalls: unknown[] = [];
    vmsRules: unknown[] = [];
    webPages: GenericResource[] = [];
}
export interface BroadcastAction {
    actionType: string;
    aggregatinCount: number;
    params: string;
    receivedFromRemoteHost: boolean;
    resourceIds: string[];
    ruleId: string;
    runtimeParams: string;
    toggleState: string;
}
export interface IdData {
    id: string
}
export interface ResourceParam {
    name: string;
    resourceId: string;
    value: string;
}
export interface GenericResource {
    id: string;
    name: string;
    parentId: string;
    typeId: string;
    url: string;
}
export interface CameraHistory {
    archivedCameras: string[];
    serverGuid: string;
}
export interface CameraUserAttributes {
    audioEnabled: boolean;
    backupContentType: string;
    backupPolicy: string;
    backupQuality: string;
    cameraId: string;
    cameraName: string;
    controlEnabled: boolean;
    dewarpingParams: string;
    disableDualStreaming: boolean;
    failoverPriority: string;
    licenseUsed: boolean;
    logicalId: string;
    maxArchiveDays: number;
    maxArchivePeriodS: number;
    minArchiveDays: number;
    minArchivePeriodS: number;
    motionMask: string;
    motionType: string;
    preferredServerId: string;
    recordAfterMotionSec: number;
    recordBeforeMotionSec: number;
    scheduleEnabled: boolean;
    scheduleTasks: ScheduleTask[];
    userDefinedGroupName: string;
}
export interface ScheduleTask {
    bitrateKbps: number;
    dayOfWeek: number;
    endTime: number;
    fps: number;
    metadataTypes: string;
    recordingType: string;
    startTime: number;
    streamQuality: string;
}
export interface Camera {
    groupId: string;
    groupName: string;
    id: string;
    mac: string;
    manuallyAdded: boolean;
    model: string;
    name: string;
    parentId: string;
    physicalId: string;
    statusFlags: string;
    typeId: string;
    url: string;
    vendor: string;
}
export interface Layout {
    backgroundHeight: number;
    backgroundImageFilename: string;
    backgroundOpacity: number;
    backgroundWidth: number;
    cellAspectRatio: number;
    cellSpacing: number;
    fixedHeight: number;
    fixedWidth: number;
    id: string;
    items: Item[];
    locked: boolean;
    logicalId: number;
    name: string;
    parentId: string;
    typeId: string;
    url: string;
}
export interface Item {
    bottom: number;
    contrastParams: ContrastParam;
    controlPtz: boolean;
    dewarpingParams: DewarpingParam;
    displayAnalyticsObjects: boolean;
    displayInfo: boolean;
    displayRoi: boolean;
    flags: number;
    id: string;
    left: number;
    resourceId: string;
    resourcePath: string;
    right: number;
    rotation: number;
    top: number;
    zoomBottom: number;
    zoomLeft: number;
    zoomRight: number;
    zoomTargetId: string;
    zoomTop: number;
}
export interface ContrastParam {
    blackLevel: number;
    enabled: boolean;
    gamma: number;
    whiteLevel: number;
}
export interface DewarpingParam {
    enabled: boolean;
    fov: number;
    panoFactor: number;
    xAngle: number;
    yAngle: number;
}
export interface License {
    key: string;
    licenseBlock: string;
}
export interface ResourceStatus {
    id: string;
    status: string;
}
export interface ResourceTypes {
    id: string;
    name: string;
    parentId: string[];
    propertyTypes: PropertyType[];
    vendor: string;
}
export interface PropertyType {
    defaultValue: string;
    name: string;
    resourceTypeId: string;
}
export interface Rule {
    actionParams: string;
    actionResourceIds: string[];
    actionType: string;
    aggregationPeriod: number;
    comment: string;
    disabled: boolean;
    eventCondition: string;
    eventResourceIds: unknown[];
    eventState: string;
    eventType: string;
    id: string;
    schedule: string;
    system: boolean;
}
export interface Server {
    authKey: string;
    flags: string;
    id: string;
    name: string;
    networkAddresses: string;
    osInfo: string;
    parentId: string;
    systemInfo: string;
    typeId: string;
    url: string;
    version: string;
}
export interface ServersUserAttributes {
    allowAutoRedundancy: boolean;
    backupBitrateBytesPerSecond: unknown[];
    locationId: number;
    maxCameras: number;
    metadataStorageId: string;
    serverId: string;
    serverName: string;
}
export interface Storage {
    addParams: AddParam[];
    id: string;
    isBackup: boolean;
    name: string;
    parentId: string;
    spaceLimit: string;
    status: string;
    storageType: string;
    typeId: string;
    url: string;
    usedForWriting: boolean;
}
export interface AddParam {
    name: string;
    value: string;
}
export interface User {
    cryptSha512Hash: string;
    digest: string;
    email: string;
    fullName: string;
    hash: string;
    id: string;
    isAdmin: boolean;
    isCloud: boolean;
    isEnabled: boolean;
    isLdap: boolean;
    name: string;
    parentId: string;
    permissions: string;
    realm: string;
    typeId: string;
    url: string;
    userRoleId: string;
}
