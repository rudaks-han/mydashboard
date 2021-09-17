import React from 'react';
import {Label, List, Statistic} from 'semantic-ui-react';
import UiShare from "../../UiShare";

const ContentLayer = props => {
    const displayListItem = () => {
        if (props.list == null) {
            return UiShare.displayListLoading();
        } else {
            const labelStyle = {fontSize: '10px'}
            const result = props.list.map(item => {
                let hasModuleError = false;
                let errorMessage = '';
                const { moduleName, measures } = item;
                let codeSmellValue, codeSmellBestValue, codeSmellColor = 'green', codeSmellMarkStyle = {display: 'none'}, codeSmellLink;
                let vulnerabilitiesValue, vulnerabilitiesBestValue, vulnerabilitiesColor = 'green', vulnerabilitiesMarkStyle = {display: 'none'}, vulnerabilitiesLink;
                let bugsValue, bugsBestValue, bugsColor = 'green', bugsMarkStyle = {display: 'none'}, bugsLink;
                let securityHotspotsValue, securityHotspotsBestValue, securityHotspotsColor = 'green', securityHotspotsMarkStyle = {display: 'none'}, securityHotspotsLink;

                measures.map(measure => {
                    let bestValue = measure.periods[0]['bestValue'];
                    let value = measure.periods[0]['value'];
                    if (measure.metric === 'new_security_hotspots') {
                        securityHotspotsBestValue = bestValue;
                        securityHotspotsValue = value;
                        securityHotspotsLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=SECURITY_HOTSPOT`;
                        if (!securityHotspotsBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} securityHotspots failed \n`;
                            securityHotspotsColor = 'red';
                            securityHotspotsMarkStyle = {verticalAlign: 'top'};
                        }
                    } else if (measure.metric === 'new_vulnerabilities') {
                        vulnerabilitiesBestValue = bestValue;
                        vulnerabilitiesValue = value;
                        vulnerabilitiesLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=VULNERABILITY`;
                        if (!vulnerabilitiesBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} vulnerability failed \n`;
                            vulnerabilitiesColor = 'red';
                            vulnerabilitiesMarkStyle = {verticalAlign: 'top'};
                        }
                    } else if (measure.metric === 'new_code_smells') {
                        codeSmellBestValue = bestValue;
                        codeSmellValue = value;
                        codeSmellLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=CODE_SMELL`
                        if (!codeSmellBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} codesmell failed \n`;
                            codeSmellColor = 'red';
                            codeSmellMarkStyle = {verticalAlign: 'top'}
                        }
                    } else if (measure.metric === 'new_bugs') {
                        bugsBestValue = bestValue;
                        bugsValue = value;
                        bugsLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=BUG`;
                        if (!bugsBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} bugs failed \n`;
                            bugsColor = 'red';
                            bugsMarkStyle = {verticalAlign: 'top'};
                        }
                    } else {
                        console.log(`"${measure.metric}" is not defined.`)
                    }
                });

                props.setQualityErrorMessage(errorMessage);

                const size = 'small'; // mini, tiny, small

                return (
                    <List.Item key={moduleName}>
                        <List.Content>
                            <List.Header style={{fontSize: '20px', paddingBottom:'20px', paddingTop: '10px'}}>{moduleName}</List.Header>
                            <List.Description>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={bugsLink} target="_blank">{bugsValue}</a>
                                        <Label circular color={bugsColor} style={bugsMarkStyle}>
                                            {bugsBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Bugs</Statistic.Label>
                                </Statistic>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={vulnerabilitiesLink} target="_blank">{vulnerabilitiesValue}</a>
                                        <Label circular color={vulnerabilitiesColor} style={vulnerabilitiesMarkStyle}>
                                            {vulnerabilitiesBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Vulnerabilities</Statistic.Label>
                                </Statistic>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={codeSmellLink} target="_blank">{codeSmellValue}</a>
                                        <Label circular color={codeSmellColor} style={codeSmellMarkStyle}>
                                            {codeSmellBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Code Smells</Statistic.Label>
                                </Statistic>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={securityHotspotsLink} target="_blank">{securityHotspotsValue}</a>
                                        <Label circular color={securityHotspotsColor} style={securityHotspotsMarkStyle}>
                                            {securityHotspotsBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Security Hotspots</Statistic.Label>
                                </Statistic>
                            </List.Description>
                        </List.Content>
                    </List.Item>
                )
            });

            return result;
        }
    }

    return (
        <div>
            <Label color='teal' ribbon='right' style={{top: '-10px'}}>
                Last update: {props.lastUpdated}
            </Label>
            <div className="list-layer">
                <List divided style={{'height': '300px'}}>
                    {displayListItem()}
                </List>
            </div>
        </div>
    )
};

export default ContentLayer;
