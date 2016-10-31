class MappingGroups {
    [groupName: string]: Dictionary<string, Mapping<any>>;
}

/**
 * Mapper
 */
class Mapper {
    /** Maps from a string index to a mapping */
    private mappings: MappingGroups;

    /** The variable used to decide what mapping group to use */
    private groupVarName: string;
    /** The group currently being modified */
    private currentGroup: string;

    /** 
     * Creates a new mapper
     * 
     * @param groupingVariableName The name of the property that will be 
     * used to decide what mapping group to use
     */
    constructor(groupingVariableName: string) {
        this.groupVarName = groupingVariableName;
        this.currentGroup = "any";
    }

    /**
     * Starts building a new mapping group, proceeding with*Mapping calls
     * will append new mappers to this group.
     * 
     * @param groupName The name of this group, any object with this name in it's 
     * groupingVariableName property will be mapped using this group
     */
    public newMappingGroup(groupName: string) {
        this.mappings[groupName] = new Dictionary<string, Mapping<any>>();
        this.currentGroup = groupName;
        return this;
    }

    /**
     * Adds a new basic mapper to the current group.
     * 
     * @param sourceName The object property this mapper will actually map.
     * @param targetSelector The JQuery selector that will be used to store the mapped value.
     * @param valueMapper The method that will be used to convert the input value to the output value.
     */
    public withBasicMapping(sourceName: string, targetSelector: string, valueMapper: (any) => string = (input) => String(input)) {
        let newMapping = new BasicMapping(targetSelector, valueMapper);
        this.mappings[this.currentGroup].add(sourceName, newMapping);
        return this;
    }

    /**
     * Adds a new validating mapper to the current group.
     * 
     * @param sourceName The object property this mapper will actually map.
     * @param targetSelector The JQuery selector that will be used to store the mapped value.
     * @param defaultValue The default value to use if the validation fails.
     * @param validator Method which validates the value passed in, if it returns true the value will 
     * be mapped, if it returns false the default value will be used.
     * @param valueMapper The method that will be used to convert the input value to the output value.
     */
    public withValidatedMapping(sourceName: string, targetSelector: string, defaultValue: string,
        validator: (any) => boolean = (input) => input == null, valueMapper: (any) => string = (input) => String(input)) 
    {
        let newValidatedMapping = new ValidatedMapping(targetSelector, defaultValue, valueMapper, validator);
        this.mappings[this.currentGroup].add(sourceName, newValidatedMapping);
        return this;
    }

    /**
     * Adds a new custom mapping to the current group, which performs all mapping operations itself.
     * 
     * @param sourceName The object property this mapper will actually map.
     * @param targetSelector The JQuery selector that will be used to store the mapped value.
     * @param mappingFunction The function that will handle the mapping, the Mapper will not perform the mapping itself.
     */
    public withCustomMapping(sourceName: string, targetSelector: string, mappingFunction: (value: any, targetSelector: string, uniqueSelector: string) => boolean) {
        let newCustomMapping = new CustomMapper(targetSelector, mappingFunction);
        this.mappings[this.currentGroup].add(sourceName, newCustomMapping);
        return this;
    }

    /**
     * Adds a new object mapping to the current group, which allows the mapper to map nested objects.
     * 
     * @param sourceName The object property this mapper will actually map.
     * @param objectMapper
     */
    public withObjectMapping(sourceName: string, objectMapper: Mapper) {
        let newObjectMapping = new ObjectMapping(objectMapper);
        this.mappings[this.currentGroup].add(sourceName, newObjectMapping);
        return this;
    }

    /**
     * Invokes a mapping group on an object.
     * 
     * @param objectToMap The object that is being mapped.
     * @param uniqueSelector The uniqueSelector specific to the form/page being mapped to.
     * @param group The mapping group to use (a dictionary of property name => mapper entries).
     * 
     * @returns A boolean value, true if all mappings completed successfully, false if not.
     */
    private invokeMappingGroup(objectToMap: any, uniqueSelector: string, group: Dictionary<string, Mapping<any>>): boolean {
        if (group == null) {
            return false;
        } else {
            let mappingResults: Array<boolean> = [];

            group.forEach((propertyName, mapper) => {
                let valueToMap = objectToMap[propertyName];
                mappingResults.push(mapper.invoke(valueToMap, uniqueSelector));
            });

            return mappingResults.reduce(((previous, current) => previous && current), true);
        }
    }

    /**
     * Invokes the mapper on the provided object.
     * 
     * @param objectToMap The object that is to be mapped.
     * @param uniqueSelector The uniqueSelector specific to the form/page being mapped to.
     * 
     * @returns A boolean value, true if all mappings completed successfully, false if not.
     */
    public map(objectToMap: any, uniqueSelector: string): boolean {
        if (objectToMap == null) {
            return false;
        } else {
            let objectGroupValue = objectToMap[this.groupVarName];
            if (objectGroupValue == null) {
                return false;
            } else {
                let mappingResults: Array<boolean> = [];

                let globalMappingGroup = this.mappings["any"];
                let objectGroup = this.mappings[objectGroupValue];

                if (globalMappingGroup == null) {
                    return this.invokeMappingGroup(objectToMap, uniqueSelector, objectGroup);
                } else {
                    return (this.invokeMappingGroup(objectToMap, uniqueSelector, globalMappingGroup)
                        && (this.invokeMappingGroup(objectToMap, uniqueSelector, objectGroup)));
                }
            }
        }
    }

}